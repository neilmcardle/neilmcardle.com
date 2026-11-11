import { baseKeymap, chainCommands } from "prosemirror-commands";
import { closeHistory, history, redo, undo } from "prosemirror-history";
import { keymap } from "prosemirror-keymap";
import { splitListItem } from "prosemirror-schema-list";
import { EditorState, type Command, type Plugin } from "prosemirror-state";
import type { Node as PMNode } from "prosemirror-model";
import { insertIndent, toggleInline } from "./commands";
import { findPlugin } from "./plugins/find";
import { focusEffectsPlugin } from "./plugins/focusEffects";
import { ghostPlugin } from "./plugins/ghost";
import { marksPlugin } from "./plugins/marks";
import { currentFindQuery, currentFocusEffects } from "./registry";
import { schema } from "./schema";

export type SetupCallbacks = {
  onModK: Command;
};

function newUndoStep(command: Command): Command {
  return (state, dispatch, view) =>
    command(state, dispatch && ((tr) => dispatch(closeHistory(tr))), view);
}

function editorKeymap(): Plugin {
  const base: Record<string, Command> = { ...baseKeymap };
  delete base.Escape;
  delete base["Mod-Enter"];
  return keymap({
    ...base,
    Enter: newUndoStep(
      chainCommands(splitListItem(schema.nodes.list_item), baseKeymap.Enter),
    ),
  });
}

function shortcutKeymap(callbacks: SetupCallbacks): Plugin {
  return keymap({
    "Mod-z": undo,
    "Shift-Mod-z": redo,
    "Mod-y": redo,
    "Mod-b": toggleInline("bold"),
    "Mod-i": toggleInline("italic"),
    "Mod-u": toggleInline("underline"),
    "Mod-k": callbacks.onModK,
    Tab: insertIndent,
    "Shift-Enter": newUndoStep((state, dispatch) => {
      const tr = state.selection.$from.parent.type.spec.code
        ? state.tr.insertText("\n")
        : state.tr.replaceSelectionWith(schema.nodes.hard_break.create());
      dispatch?.(tr.scrollIntoView());
      return true;
    }),
  });
}

export function createEditorState(
  doc: PMNode,
  callbacks: SetupCallbacks,
): EditorState {
  return EditorState.create({
    doc,
    plugins: [
      history(),
      shortcutKeymap(callbacks),
      editorKeymap(),
      marksPlugin(),
      focusEffectsPlugin(currentFocusEffects),
      findPlugin(currentFindQuery),
      ghostPlugin(),
    ],
  });
}
