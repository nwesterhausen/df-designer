import { range } from "lodash";
import * as coordinates from "../../lib/coordinates";
import { wallMap } from "../../static/tilesetNames";
import { selectLevelTiles } from "../reducers/tilesReducer";
import { selectCommandMap } from "../reducers/toolReducer";
import { SelectedCoords, State, Tile, TilesMap, TileSprite } from "../types";
import { selectExtents } from "./extentsSelectors";

const CHUNK_SIZE = 10;
export const selectChunks = (state: State) => {
  const extents = selectExtents(state);
  if (!extents) {
    return [];
  }
  // account for walls, and keep consistent 0,0 center
  const allChunkExtents = {
    startX: 0,
    endX: extents.endX + 1,
    startY: 0,
    endY: extents.endY + 1,
  };
  return range(
    allChunkExtents.startX,
    allChunkExtents.endX,
    CHUNK_SIZE,
  ).flatMap(x =>
    range(allChunkExtents.startY, allChunkExtents.endY, CHUNK_SIZE).flatMap(
      y => {
        const chunkExtents = {
          startX: x,
          endX: x + CHUNK_SIZE - 1,
          startY: y,
          endY: y + CHUNK_SIZE - 1,
        };
        return {
          ...chunkExtents,
          tiles: selectTiles(state, chunkExtents),
        };
      },
    ),
  );
};

const selectTilesCache: {
  zLevel: number;
  cache: { [key: string]: TileSprite[] };
} = {
  zLevel: 0,
  cache: {},
};
const selectTiles = (state: State, selection: SelectedCoords) => {
  if (selectTilesCache.zLevel !== state.tiles.zLevel) {
    selectTilesCache.zLevel = state.tiles.zLevel;
    selectTilesCache.cache = {};
  }
  const tiles = selectLevelTiles(state, { zLevel: state.tiles.zLevel });
  const key = `${selection.startX},${selection.startY},${selection.endX},${
    selection.endY
  }`;
  let invalidate = false;
  for (const id of state.tiles.updates) {
    const { x, y } = coordinates.fromId(id);
    if (coordinates.within(coordinates.expand(selection, 1), { x, y })) {
      invalidate = true;
      break;
    }
  }
  if (!invalidate && selectTilesCache.cache[key]) {
    return selectTilesCache.cache[key];
  }
  const result = createTiles(tiles, selection).concat(
    createWalls(tiles, selection),
  );
  selectTilesCache.cache[key] = result;
  return result;
};

const createTiles = (
  tiles: TilesMap,
  selection: SelectedCoords,
): TileSprite[] => {
  const commandMap = selectCommandMap();
  return Object.values(tiles)
    .filter(tile => coordinates.within(selection, coordinates.fromId(tile.id)))
    .reduce((result: TileSprite[], tile) => {
      if (tile.designation) {
        result.push({
          id: tile.id,
          textureName: commandMap[tile.designation].textures[0],
        });
      }
      if (tile.item) {
        result.push({
          id: tile.id,
          textureName: commandMap[tile.item].textures[0],
        });
      }
      return result;
    }, []);
};

const createWalls = (
  tiles: TilesMap,
  selection: SelectedCoords,
): TileSprite[] => {
  const walls = new Set<string>();
  Object.entries(tiles).forEach(([tileId, tile]) => {
    if (exposed(tile)) {
      for (const id of neighborIds(tileId)) {
        if (!tiles[id]) {
          walls.add(id);
        }
      }
    }
  });
  return Array.from(walls.values())
    .filter(wallId => within(wallId, selection))
    .map(wallId => {
      const wallNumber = neighborIds(wallId)
        .filter(id => id !== wallId)
        .reduce((bits, id, index) => {
          if (exposed(tiles[id])) {
            return bits + 2 ** index;
          }
          return bits;
        }, 0);

      return {
        id: wallId,
        textureName: wallMap[wallNumber],
      };
    });
};

// TODO loops are fun and all
const neighborIds = (id: string) => {
  const { x, y } = coordinates.fromId(id);
  return [
    coordinates.toId(x - 1, y - 1),
    coordinates.toId(x, y - 1),
    coordinates.toId(x + 1, y - 1),
    coordinates.toId(x - 1, y),
    coordinates.toId(x, y),
    coordinates.toId(x + 1, y),
    coordinates.toId(x - 1, y + 1),
    coordinates.toId(x, y + 1),
    coordinates.toId(x + 1, y + 1),
  ];
};

const exposed = (tile: Tile | null) => {
  if (!tile) {
    return false;
  }
  return !!tile.designation;
};

// TODO move to shared place along with tiles/actions version
const within = (id: string, { startX, endX, startY, endY }: SelectedCoords) => {
  const { x, y } = coordinates.fromId(id);
  return startX <= x && x <= endX && startY <= y && y <= endY;
};