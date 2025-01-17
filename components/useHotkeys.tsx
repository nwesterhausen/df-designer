import { useDispatch } from "react-redux";
import { useHotKey, useKeyHandler } from "../lib/useHotKey";
import { tilesActions, toolActions } from "../store/actions";

export const useHotkeys = () => {
  const keysPressed = useHotKey();
  const dispatch = useDispatch();
  useKeyHandler(key => {
    switch (key) {
      case "delete":
        dispatch(tilesActions.removeSelection());
        break;
      case "esc":
        dispatch(toolActions.cancel());
        break;
      case ".":
        if (keysPressed.includes("shift")) {
          dispatch(tilesActions.zLevelDown());
        }
        break;
      case ",":
        if (keysPressed.includes("shift")) {
          dispatch(tilesActions.zLevelUp());
        }
        break;
      case "z":
        if (keysPressed.includes("shift") && keysPressed.includes("ctrl")) {
          dispatch(tilesActions.redo());
        } else if (keysPressed.includes("ctrl")) {
          dispatch(tilesActions.undo());
        }
    }
  });
};
