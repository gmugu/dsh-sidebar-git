window.__ModuleLoader__.load({
	id: "dsh-sidebar-git",
	factory: function (require) {
		var module = { exports: {} };
		var exports = module.exports;
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// css-module:D:\ws\dsh-sidebar-git\src\client\changes.module.css
var require_changes = __commonJS({
  "css-module:D:\\ws\\dsh-sidebar-git\\src\\client\\changes.module.css"(exports, module2) {
    var css5 = "/* The unified changes tab: lens switcher + Git lens + session lens + the\n   shared preview pane. Semantic --dsw-alias tokens only (skin contract).\n   The git lens styles moved here from sidebar.module.css when the git panel\n   became a lens of this tab; the generic placeholder/empty/error trio stays\n   duplicated in both modules (the diff tab still owns its copy). */\n\n.dshgit_root { display: flex; flex-direction: column; min-height: 0; height: 100%; background: var(--dsw-alias-bg-base); color: var(--dsw-alias-label-primary); font-size: 12px; }\n\n/* \u2500\u2500 Lens switcher \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n\n.dshgit_lensBar { flex: none; display: flex; align-items: center; padding: 8px 8px 4px 12px; }\n.dshgit_lensSwitch { display: inline-flex; gap: 2px; padding: 2px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 8px; }\n.dshgit_lensButton { border: 0; border-radius: 6px; padding: 2px 10px; background: transparent; color: var(--dsw-alias-label-secondary); font: var(--dsw-font-xxxs-strong-11); cursor: pointer; }\n.dshgit_lensButton:hover { color: var(--dsw-alias-label-primary); }\n.dshgit_lensButton[data-active='true'] { background: var(--dsw-alias-interactive-bg-active); color: var(--dsw-alias-label-primary); }\n\n/* \u2500\u2500 Git lens (the former git panel) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n\n.dshgit_git {\n  flex: 1;\n  min-height: 0;\n  min-width: 0;\n  display: flex;\n  flex-direction: column;\n  overflow-y: auto;\n  /* Tab pages never scroll horizontally: content wraps or truncates to the\n     panel width instead of panning sideways. */\n  overflow-x: hidden;\n}\n\n.dshgit_gitHeader {\n  flex: none;\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  height: 36px;\n  padding: 0 8px 0 12px;\n}\n\n.dshgit_gitWorktreeRow {\n  flex: none;\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 6px 8px 0 12px;\n}\n\n.dshgit_gitWorktreeLabel {\n  flex: none;\n  color: var(--dsw-alias-label-tertiary);\n  font: var(--dsw-font-xxxs-11);\n}\n\n.dshgit_gitBranchSelect {\n  flex: 1;\n  min-width: 0;\n  height: 26px;\n  padding: 0 6px;\n  border: 1px solid var(--dsw-alias-border-l2);\n  border-radius: 6px;\n  background: var(--dsw-alias-bg-base);\n  color: var(--dsw-alias-label-primary);\n  font: var(--dsw-font-xxs-12);\n}\n\n.dshgit_gitSection {\n  border-top: 1px solid var(--dsw-alias-border-l1);\n}\n\n.dshgit_gitSectionHeader {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 6px 12px 4px;\n  font: var(--dsw-font-xxxs-strong-11);\n  color: var(--dsw-alias-label-tertiary);\n  text-transform: uppercase;\n}\n\n.dshgit_gitLink {\n  border: none;\n  background: transparent;\n  font: var(--dsw-font-xxxs-11);\n  color: var(--dsw-alias-brand-primary);\n  cursor: pointer;\n  padding: 0;\n}\n\n.dshgit_gitLink:hover:not(:disabled) {\n  text-decoration: underline;\n}\n\n/* The bulk actions of a section header (discard all / stage all) sit as one\n   right-aligned cluster. */\n.dshgit_gitSectionActions {\n  display: inline-flex;\n  align-items: center;\n  gap: 8px;\n}\n\n/* A destructive bulk action keeps the link's size and turns red. */\n.dshgit_gitLink[data-danger='true'] {\n  color: var(--dsw-alias-state-error-primary);\n}\n\n.dshgit_gitLink:disabled {\n  opacity: 0.4;\n  cursor: default;\n}\n\n.dshgit_gitRow {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  min-height: 34px;\n  margin: 0 6px;\n  padding: 0 8px;\n  border-radius: 8px;\n  animation: dshgit_dsh-row-in 150ms var(--ds-ease-in-out);\n}\n\n.dshgit_gitRow:hover {\n  background: var(--dsw-alias-interactive-bg-hover);\n}\n\n.dshgit_gitRow[data-selected='true'] {\n  background: var(--dsw-alias-interactive-bg-active);\n}\n\n.dshgit_gitRowMain {\n  flex: 1;\n  min-width: 0;\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  border: none;\n  background: transparent;\n  padding: 3px 0;\n  cursor: pointer;\n  text-align: left;\n}\n\n.dshgit_gitBadge {\n  flex: none;\n  width: 20px;\n  height: 16px;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  border-radius: 4px;\n  font: var(--dsw-font-xxxs-strong-11);\n  background: var(--dsw-alias-interactive-bg-hover);\n  color: var(--dsw-alias-label-secondary);\n}\n\n/* Status-letter tint: A added / D deleted / M\xB7R modified / C\xB7U conflicts;\n   untracked '?' reads as a not-yet-added file, so it shares the added tint. */\n.dshgit_gitBadge[data-letter='A'], .dshgit_gitBadge[data-letter='?'] { color: var(--dsw-alias-state-success-primary); }\n.dshgit_gitBadge[data-letter='D'] { color: var(--dsw-alias-state-error-primary); }\n.dshgit_gitBadge[data-letter='M'], .dshgit_gitBadge[data-letter='R'] { color: var(--dsw-alias-state-business-primary); }\n.dshgit_gitBadge[data-letter='C'], .dshgit_gitBadge[data-letter='U'] { color: var(--dsw-alias-state-warn-primary); }\n\n.dshgit_gitName {\n  flex: 1;\n  min-width: 0;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  font: var(--dsw-font-s-14);\n  color: var(--dsw-alias-label-primary);\n}\n\n.dshgit_gitEmpty {\n  padding: 4px 12px 8px;\n  font: var(--dsw-font-xxs-12);\n  color: var(--dsw-alias-label-tertiary);\n}\n\n.dshgit_gitPlaceholder {\n  padding: 16px;\n  font: var(--dsw-font-xxs-12);\n  color: var(--dsw-alias-label-tertiary);\n  text-align: center;\n}\n\n.dshgit_gitError {\n  padding: 8px 12px;\n  font: var(--dsw-font-xxs-12);\n  color: var(--dsw-alias-state-error-primary);\n  white-space: pre-wrap;\n}\n\n.dshgit_gitConfirmDesc {\n  margin: 0;\n  font: var(--dsw-font-s-14);\n  color: var(--dsw-alias-label-primary);\n  white-space: pre-wrap;\n}\n\n.dshgit_gitCommit {\n  display: flex;\n  gap: 6px;\n  padding: 8px 12px;\n  border-top: 1px solid var(--dsw-alias-border-l1);\n  align-items: center;\n}\n\n.dshgit_gitCommitInput {\n  flex: 1;\n  min-width: 0;\n}\n\n.dshgit_gitCommitButton {\n  flex: none;\n  height: 26px;\n  padding: 0 12px;\n  border: none;\n  border-radius: 6px;\n  background: var(--dsw-alias-button-primary-fill);\n  color: var(--dsw-alias-label-primary-inverted);\n  font: var(--dsw-font-xxs-strong-12);\n  cursor: pointer;\n}\n\n.dshgit_gitCommitButton:hover:not(:disabled) {\n  background: var(--dsw-alias-button-primary-hover);\n}\n\n.dshgit_gitCommitButton:disabled {\n  opacity: 0.45;\n  cursor: default;\n}\n\n/* A history row: line 1 = hash + subject, line 2 = ref badges + author/date\n   (badges live on the second line so they never crowd the subject). */\n.dshgit_gitLogRow {\n  display: flex;\n  flex-direction: column;\n  gap: 2px;\n  padding: 5px 12px;\n  cursor: pointer;\n  border-radius: 8px;\n}\n\n.dshgit_gitLogRow:hover {\n  background: var(--dsw-alias-interactive-bg-hover);\n}\n\n.dshgit_gitLogRow[data-selected='true'] {\n  background: var(--dsw-alias-interactive-bg-active);\n}\n\n.dshgit_gitLogLine1 {\n  display: flex;\n  align-items: baseline;\n  gap: 8px;\n  min-width: 0;\n}\n\n.dshgit_gitLogHash {\n  flex: none;\n  font: var(--dsw-font-markdown-code-block-small);\n  color: var(--dsw-alias-label-tertiary);\n}\n\n.dshgit_gitLogLine2 {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  min-width: 0;\n  flex-wrap: wrap;\n}\n\n.dshgit_gitLogRef {\n  flex: none;\n  padding: 0 5px;\n  border: 1px solid var(--dsw-alias-border-l2);\n  border-radius: 999px;\n  font: var(--dsw-font-xxxs-strong-11);\n  color: var(--dsw-alias-brand-primary);\n  white-space: nowrap;\n}\n\n.dshgit_gitLogSubject {\n  flex: 1;\n  min-width: 0;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  font: var(--dsw-font-s-14);\n  color: var(--dsw-alias-label-primary);\n}\n\n.dshgit_gitLogMeta {\n  font: var(--dsw-font-xxxs-11);\n  color: var(--dsw-alias-label-tertiary);\n}\n\n.dshgit_gitLogMore {\n  display: block;\n  width: calc(100% - 24px);\n  margin: 4px 12px 8px;\n  padding: 6px 0;\n  border: 1px solid var(--dsw-alias-border-l2);\n  border-radius: 6px;\n  background: transparent;\n  font: var(--dsw-font-xxs-12);\n  color: var(--dsw-alias-label-secondary);\n  cursor: pointer;\n}\n\n.dshgit_gitLogMore:hover:not(:disabled) {\n  background: var(--dsw-alias-interactive-bg-hover);\n  color: var(--dsw-alias-label-primary);\n}\n\n.dshgit_gitLogMore:disabled {\n  opacity: 0.5;\n  cursor: default;\n}\n\n/* \u2500\u2500 Session lens (this round's files) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n\n.dshgit_session { flex: 1; min-height: 0; display: flex; flex-direction: column; }\n\n.dshgit_filterRow { flex: none; display: flex; gap: 4px; padding: 2px 8px 6px 12px; flex-wrap: wrap; }\n.dshgit_filterChip { border: 1px solid var(--dsw-alias-border-l2); border-radius: 999px; padding: 1px 8px; background: transparent; color: var(--dsw-alias-label-secondary); font: var(--dsw-font-xxxs-11); cursor: pointer; }\n.dshgit_filterChip:hover { color: var(--dsw-alias-label-primary); background: var(--dsw-alias-interactive-bg-hover); }\n.dshgit_filterChip[data-active='true'] { background: var(--dsw-alias-interactive-bg-active); color: var(--dsw-alias-label-primary); border-color: transparent; }\n\n.dshgit_sessionList { flex: 1; min-height: 0; overflow-y: auto; padding: 0 6px 10px; }\n.dshgit_empty { color: var(--dsw-alias-label-tertiary); padding: 24px 8px; text-align: center; }\n.dshgit_loadError { margin: 4px 8px; padding: 6px 10px; border-left: 3px solid var(--dsw-alias-state-warn-primary); border-radius: 0 6px 6px 0; color: var(--dsw-alias-label-secondary); font-size: 11px; }\n\n.dshgit_fileGroup { margin-bottom: 6px; }\n/* The group label sits between op blocks: extra head padding separates it from\n   the previous file's rows, the first group starts flush. */\n.dshgit_filePath { display: block; color: var(--dsw-alias-label-tertiary); font-family: var(--ds-font-family-code, monospace); font-size: 11px; padding: 6px 4px 2px; word-break: break-all; }\n.dshgit_fileGroup:first-child .dshgit_filePath { padding-top: 2px; }\n.dshgit_opRow { display: flex; align-items: center; gap: 6px; width: 100%; border: 0; border-radius: 6px; background: transparent; color: var(--dsw-alias-label-primary); font: inherit; font-size: 11px; padding: 3px 5px; cursor: pointer; text-align: left; }\n.dshgit_opRow:hover { background: var(--dsw-alias-interactive-bg-hover); }\n.dshgit_opRow[data-selected='true'] { background: var(--dsw-alias-interactive-bg-active); }\n/* A failed op carries a quiet error inset bar (the flag chip names it). */\n.dshgit_opRow[data-op-error='true'] { box-shadow: inset 2px 0 0 var(--dsw-alias-state-error-primary); }\n.dshgit_opKind { border-radius: 4px; font-size: 10px; line-height: 16px; padding: 0 5px; background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-secondary); flex: none; }\n.dshgit_opKind[data-kind='write'] { color: var(--dsw-alias-state-success-primary); }\n.dshgit_opKind[data-kind='edit'] { color: var(--dsw-alias-state-business-primary); }\n/* Size + relative time ride as one right-aligned cluster so the kind chips\n   form a scannable left rail and the meta column stays flush right. */\n.dshgit_opMeta { margin-left: auto; display: inline-flex; align-items: baseline; gap: 8px; flex: none; min-width: 0; }\n.dshgit_opTime { color: var(--dsw-alias-label-tertiary); font-size: 10px; flex: none; }\n.dshgit_opFlag { color: var(--dsw-alias-state-business-primary); font-size: 10px; flex: none; }\n.dshgit_opFlagError { color: var(--dsw-alias-state-error-primary); font-size: 10px; flex: none; }\n.dshgit_opSize { color: var(--dsw-alias-label-tertiary); font-size: 10px; flex: none; font-family: var(--ds-font-family-code, monospace); }\n\n/* \u2500\u2500 Shared preview pane \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n\n.dshgit_redactBanner { flex: none; font: var(--dsw-font-xxxs-strong-11); padding: 2px 8px; border-radius: 7px; color: var(--dsw-alias-state-warn-primary); background: var(--dsw-alias-interactive-bg-hover); white-space: nowrap; }\n.dshgit_mdToggle { flex: none; border: 1px solid var(--dsw-alias-border-l1); border-radius: 7px; background: transparent; color: var(--dsw-alias-label-secondary); font: var(--dsw-font-xxxs-strong-11); padding: 2px 8px; cursor: pointer; }\n.dshgit_mdToggle:hover { background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-primary); }\n.dshgit_mdToggle[data-on='true'] { border-color: var(--dsw-alias-state-business-primary); color: var(--dsw-alias-state-business-primary); }\n.dshgit_mdBody { padding: 12px 16px 20px; font: var(--dsw-font-xs-regular-13); line-height: 1.6; min-height: 0; overflow-y: auto; }\n.dshgit_htmlPane { flex: 1; min-height: 0; display: flex; }\n.dshgit_htmlFrame { flex: 1; width: 100%; border: none; background: var(--dsw-alias-bg-base); }\n\n.dshgit_diffPane { border-top: 1px solid var(--dsw-alias-border-l1); display: flex; flex-direction: column; flex: none; min-height: 0; }\n.dshgit_dragHandle { flex: none; height: 8px; cursor: ns-resize; position: relative; background: var(--dsw-alias-bg-base); }\n.dshgit_dragHandle::after { content: ''; position: absolute; left: calc(50% - 18px); top: 3px; width: 36px; height: 2px; border-radius: 1px; background: var(--dsw-alias-border-l2); }\n.dshgit_dragHandle:hover::after, .dshgit_dragHandle:focus-visible::after { background: var(--dsw-alias-state-business-primary); }\n.dshgit_diffHead { display: flex; align-items: center; gap: 6px; padding: 3px 8px 3px 10px; border-bottom: 1px solid var(--dsw-alias-border-l1); }\n.dshgit_diffKind { flex: none; border-radius: 4px; font-size: 10px; line-height: 16px; padding: 0 5px; background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-secondary); }\n.dshgit_diffKind[data-kind='git'] { color: var(--dsw-alias-brand-primary); }\n.dshgit_diffKind[data-kind='write'] { color: var(--dsw-alias-state-success-primary); }\n.dshgit_diffKind[data-kind='edit'] { color: var(--dsw-alias-state-business-primary); }\n/* The path keeps its tail (the file name is the identity; directories are\n   context): an RTL paragraph renders an ASCII path in reading order while\n   clipping its HEAD under the ellipsis. */\n.dshgit_diffPath { flex: 1; direction: rtl; font-family: var(--ds-font-family-code, monospace); font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--dsw-alias-label-primary); min-width: 0; }\n.dshgit_diffStats { flex: none; display: inline-flex; gap: 5px; font-size: 10px; font-family: var(--ds-font-family-code, monospace); }\n\n.dshgit_iconButton {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  width: 24px;\n  height: 24px;\n  padding: 0;\n  border: none;\n  border-radius: 6px;\n  background: transparent;\n  color: var(--dsw-alias-label-secondary);\n  cursor: pointer;\n  flex: none;\n}\n.dshgit_iconButton:hover:not(:disabled) { background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-primary); }\n/* A destructive row action (discard / delete) tints red on hover: the icon\n   alone is quiet, the intent is not. */\n.dshgit_iconButton[data-danger='true']:hover:not(:disabled) { color: var(--dsw-alias-state-error-primary); }\n.dshgit_iconButton:disabled { opacity: 0.4; cursor: default; }\n\n.dshgit_paneBody { flex: 1; min-height: 0; overflow-y: auto; }\n/* A one-line notice above the document: a capped read, or a binary file with\n   nothing to draw. */\n.dshgit_paneNotice { padding: 5px 10px; color: var(--dsw-alias-label-secondary); font: var(--dsw-font-xxxs-11); border-bottom: 1px solid var(--dsw-alias-border-l1); }\n.dshgit_readError { color: var(--dsw-alias-state-error-primary); border-left: 3px solid var(--dsw-alias-state-error-primary); border-radius: 0 6px 6px 0; margin: 6px 8px; padding: 6px 10px; white-space: pre-wrap; word-break: break-word; }\n.dshgit_priorUnknown { color: var(--dsw-alias-label-tertiary); font-size: 10px; padding: 3px 10px; }\n\n/* \u2500\u2500 Shared bits \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n\n/* Mount fade for rows (the app's session-row reveal). */\n@keyframes dshgit_dsh-row-in {\n  from { opacity: 0; }\n}\n\n/* Keyboard focus rings match the shared sidebar convention. */\n.dshgit_gitLink:focus-visible, .dshgit_gitRowMain:focus-visible, .dshgit_gitLogRow:focus-visible,\n.dshgit_gitCommitButton:focus-visible, .dshgit_gitLogMore:focus-visible, .dshgit_gitBranchSelect:focus-visible,\n.dshgit_lensButton:focus-visible, .dshgit_filterChip:focus-visible, .dshgit_iconButton:focus-visible,\n.dshgit_dragHandle:focus-visible {\n  outline: 2px solid var(--dsw-alias-interactive-bg-hover-accent);\n  outline-offset: -1px;\n}\n\n@media (prefers-reduced-motion: reduce) {\n  .dshgit_gitRow { animation: none; }\n}\n";
    var tagId = "dsh-sidebar-git/changes.module.css";
    if (typeof document !== "undefined" && document.querySelector('style[data-plugin-css="' + tagId + '"]') === null) {
      const tag = document.createElement("style");
      tag.dataset.plugin = "dsh-sidebar-git";
      tag.dataset.pluginCss = tagId;
      tag.textContent = css5;
      document.head.appendChild(tag);
    }
    module2.exports = {
      "root": "dshgit_root",
      "lensBar": "dshgit_lensBar",
      "lensSwitch": "dshgit_lensSwitch",
      "lensButton": "dshgit_lensButton",
      "git": "dshgit_git",
      "gitHeader": "dshgit_gitHeader",
      "gitWorktreeRow": "dshgit_gitWorktreeRow",
      "gitWorktreeLabel": "dshgit_gitWorktreeLabel",
      "gitBranchSelect": "dshgit_gitBranchSelect",
      "gitSection": "dshgit_gitSection",
      "gitSectionHeader": "dshgit_gitSectionHeader",
      "gitLink": "dshgit_gitLink",
      "gitSectionActions": "dshgit_gitSectionActions",
      "gitRow": "dshgit_gitRow",
      "gitRowMain": "dshgit_gitRowMain",
      "gitBadge": "dshgit_gitBadge",
      "gitName": "dshgit_gitName",
      "gitEmpty": "dshgit_gitEmpty",
      "gitPlaceholder": "dshgit_gitPlaceholder",
      "gitError": "dshgit_gitError",
      "gitConfirmDesc": "dshgit_gitConfirmDesc",
      "gitCommit": "dshgit_gitCommit",
      "gitCommitInput": "dshgit_gitCommitInput",
      "gitCommitButton": "dshgit_gitCommitButton",
      "gitLogRow": "dshgit_gitLogRow",
      "gitLogLine1": "dshgit_gitLogLine1",
      "gitLogHash": "dshgit_gitLogHash",
      "gitLogLine2": "dshgit_gitLogLine2",
      "gitLogRef": "dshgit_gitLogRef",
      "gitLogSubject": "dshgit_gitLogSubject",
      "gitLogMeta": "dshgit_gitLogMeta",
      "gitLogMore": "dshgit_gitLogMore",
      "session": "dshgit_session",
      "filterRow": "dshgit_filterRow",
      "filterChip": "dshgit_filterChip",
      "sessionList": "dshgit_sessionList",
      "empty": "dshgit_empty",
      "loadError": "dshgit_loadError",
      "fileGroup": "dshgit_fileGroup",
      "filePath": "dshgit_filePath",
      "opRow": "dshgit_opRow",
      "opKind": "dshgit_opKind",
      "opMeta": "dshgit_opMeta",
      "opTime": "dshgit_opTime",
      "opFlag": "dshgit_opFlag",
      "opFlagError": "dshgit_opFlagError",
      "opSize": "dshgit_opSize",
      "redactBanner": "dshgit_redactBanner",
      "mdToggle": "dshgit_mdToggle",
      "mdBody": "dshgit_mdBody",
      "htmlPane": "dshgit_htmlPane",
      "htmlFrame": "dshgit_htmlFrame",
      "diffPane": "dshgit_diffPane",
      "dragHandle": "dshgit_dragHandle",
      "diffHead": "dshgit_diffHead",
      "diffKind": "dshgit_diffKind",
      "diffPath": "dshgit_diffPath",
      "diffStats": "dshgit_diffStats",
      "iconButton": "dshgit_iconButton",
      "paneBody": "dshgit_paneBody",
      "paneNotice": "dshgit_paneNotice",
      "readError": "dshgit_readError",
      "priorUnknown": "dshgit_priorUnknown"
    };
  }
});

// css-module:D:\ws\dsh-sidebar-git\src\client\diff\diff.module.css
var require_diff = __commonJS({
  "css-module:D:\\ws\\dsh-sidebar-git\\src\\client\\diff\\diff.module.css"(exports, module2) {
    var css5 = "/* The shared diff renderer (DiffRows / DiffFiles): one visual language for\n   every file-change surface \u2014 the changes tab's preview pane, the diff tab,\n   session-op diffs and git diffs alike. Semantic --dsw-alias tokens only\n   (skin contract); the syntax-token hues derive from the alias state tokens\n   via color-mix so they sit BETWEEN the diff colors (violet keywords, teal\n   strings, brand-tinted types, warn-family numbers/functions, magenta\n   macros) instead of colliding with red del / green add / blue mod. */\n\n.dshgit_rows { padding: 4px 0 8px; font-family: var(--ds-font-family-code, monospace); font-size: 11px; }\n.dshgit_row { display: flex; align-items: flex-start; gap: 5px; padding: 0 10px; line-height: 18px; cursor: default; }\n.dshgit_row[data-folded='true'] { cursor: pointer; }\n.dshgit_lineNo { flex: none; width: 2.5em; color: var(--dsw-alias-label-tertiary); text-align: right; user-select: none; font-size: 10px; }\n.dshgit_sign { flex: none; width: 1em; text-align: center; user-select: none; font-weight: 700; }\n\n.dshgit_row[data-kind='del'] .dshgit_sign, .dshgit_row[data-kind='del'] .dshgit_text { color: var(--dsw-alias-state-error-primary); }\n.dshgit_row[data-kind='add'] .dshgit_sign, .dshgit_row[data-kind='add'] .dshgit_text { color: var(--dsw-alias-state-success-primary); }\n.dshgit_row[data-kind='mod'] .dshgit_sign, .dshgit_row[data-kind='mod'] .dshgit_text { color: var(--dsw-alias-state-business-primary); }\n.dshgit_row[data-kind='context'] .dshgit_sign, .dshgit_row[data-kind='context'] .dshgit_text { color: var(--dsw-alias-label-secondary); }\n.dshgit_row[data-kind='read'] .dshgit_text { color: var(--dsw-alias-label-primary); }\n\n/* Faint row tints under changed lines (GitHub-style, lighter than the text\n   hue so the syntax colors stay readable on top). */\n.dshgit_row[data-kind='del'] { background: color-mix(in srgb, var(--dsw-alias-state-error-primary) 8%, transparent); }\n.dshgit_row[data-kind='add'] { background: color-mix(in srgb, var(--dsw-alias-state-success-primary) 8%, transparent); }\n.dshgit_row[data-kind='mod'] { background: color-mix(in srgb, var(--dsw-alias-state-business-primary) 8%, transparent); }\n\n.dshgit_row .dshgit_text { flex: 1; min-width: 0; white-space: pre-wrap; word-break: break-word; }\n.dshgit_row[data-folded='true'] .dshgit_text { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }\n\n/* The `\\ No newline at end of file` marker row attached to a hunk's tail. */\n.dshgit_row[data-kind='meta'] .dshgit_metaText { color: var(--dsw-alias-label-tertiary); font-style: italic; }\n\n/* Intra-line changed substring inside a rewritten (mod) line. */\n.dshgit_inlineChange { background: color-mix(in srgb, var(--dsw-alias-state-business-primary) 26%, transparent); border-radius: 3px; padding: 0 1px; }\n\n/* Syntax-token colors: alias-token mixes between the diff hues. */\n.dshgit_tokComment { color: var(--dsw-alias-label-tertiary); font-style: italic; }\n.dshgit_tokKeyword { color: color-mix(in oklab, var(--dsw-alias-state-business-primary) 55%, var(--dsw-alias-state-error-primary)); }\n.dshgit_tokString { color: color-mix(in oklab, var(--dsw-alias-state-success-primary) 45%, var(--dsw-alias-state-business-primary)); }\n.dshgit_tokType { color: color-mix(in oklab, var(--dsw-alias-brand-primary) 60%, var(--dsw-alias-state-success-primary)); }\n.dshgit_tokNumber { color: var(--dsw-alias-state-warn-primary); }\n.dshgit_tokFunction { color: color-mix(in oklab, var(--dsw-alias-state-warn-primary) 55%, var(--dsw-alias-state-error-primary)); }\n.dshgit_tokMacro { color: color-mix(in oklab, var(--dsw-alias-state-error-primary) 45%, var(--dsw-alias-state-business-primary)); }\n\n/* Hunk-fold row: collapsed marker chip; expanded padding drops to 0 so the\n   revealed rows keep the x-alignment of hunk rows (they carry their own).\n   Only an expandable fold (enough hidden rows to be worth a click) reads as\n   interactive \u2014 the \u203A chevron matches the multi-file document's disclosure. */\n.dshgit_foldRow { padding: 0 10px; }\n.dshgit_foldRow[data-expandable='true'] { cursor: pointer; }\n.dshgit_foldRow[data-expandable='true']:hover { background: var(--dsw-alias-interactive-bg-hover); }\n.dshgit_foldRow[data-expanded='true'] { padding: 0; }\n.dshgit_foldRow[data-expanded='true'] { cursor: default; }\n.dshgit_foldRow[data-expanded='true'] .dshgit_foldMarker { display: none; }\n.dshgit_foldMarker { display: inline-flex; align-items: center; gap: 5px; padding: 2px 7px; border-radius: 4px; margin: 2px 0; color: var(--dsw-alias-label-tertiary); background: var(--dsw-alias-interactive-bg-hover); }\n.dshgit_foldRow[data-expandable='true'] .dshgit_foldMarker { color: var(--dsw-alias-label-secondary); }\n.dshgit_foldRow[data-expandable='true'] .dshgit_foldMarker::before { content: '\u203A'; color: var(--dsw-alias-label-tertiary); transition: transform var(--ds-transition-duration-slow) var(--ds-ease-in-out); }\n\n/* The huge-file overflow reveal under a capped hunk. */\n.dshgit_expand { display: block; width: calc(100% - 20px); margin: 4px 10px; padding: 4px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 6px; background: transparent; color: var(--dsw-alias-label-secondary); font: inherit; font-size: 11px; cursor: pointer; }\n.dshgit_expand:hover { background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-primary); }\n\n/* Multi-file documents (commit patches): collapsible file headers. */\n.dshgit_files { display: flex; flex-direction: column; }\n.dshgit_fileBlock { display: flex; flex-direction: column; }\n.dshgit_file { display: flex; align-items: center; gap: 6px; width: 100%; padding: 6px 10px; border: 0; background: transparent; font: inherit; font-size: 11px; text-align: left; cursor: pointer; }\n.dshgit_file:disabled { cursor: default; }\n.dshgit_file:hover:not(:disabled) { background: var(--dsw-alias-interactive-bg-hover); }\n.dshgit_fileChevron { flex: none; width: 12px; color: var(--dsw-alias-label-tertiary); transition: transform var(--ds-transition-duration-slow) var(--ds-ease-in-out); }\n.dshgit_fileChevronExpanded { transform: rotate(90deg); }\n.dshgit_filePath { font-family: var(--ds-font-family-code, monospace); color: var(--dsw-alias-label-primary); word-break: break-all; min-width: 0; }\n.dshgit_fileOld { flex: none; max-width: 40%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--dsw-alias-label-tertiary); font-family: var(--ds-font-family-code, monospace); }\n.dshgit_fileTag { flex: none; border-radius: 4px; font-size: 10px; line-height: 16px; padding: 0 5px; background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-secondary); }\n.dshgit_fileStats { margin-left: auto; flex: none; display: inline-flex; gap: 5px; font-size: 10px; font-family: var(--ds-font-family-code, monospace); }\n.dshgit_statAdd { color: var(--dsw-alias-state-success-primary); }\n.dshgit_statDel { color: var(--dsw-alias-state-error-primary); }\n\n/* Keyboard focus rings match the shared sidebar convention. */\n.dshgit_row:focus-visible, .dshgit_foldRow:focus-visible, .dshgit_file:focus-visible, .dshgit_expand:focus-visible {\n  outline: 2px solid var(--dsw-alias-interactive-bg-hover-accent);\n  outline-offset: -1px;\n}\n\n@media (prefers-reduced-motion: reduce) {\n  .dshgit_fileChevron { transition: none; }\n}\n";
    var tagId = "dsh-sidebar-git/diff.module.css";
    if (typeof document !== "undefined" && document.querySelector('style[data-plugin-css="' + tagId + '"]') === null) {
      const tag = document.createElement("style");
      tag.dataset.plugin = "dsh-sidebar-git";
      tag.dataset.pluginCss = tagId;
      tag.textContent = css5;
      document.head.appendChild(tag);
    }
    module2.exports = {
      "rows": "dshgit_rows",
      "row": "dshgit_row",
      "lineNo": "dshgit_lineNo",
      "sign": "dshgit_sign",
      "text": "dshgit_text",
      "metaText": "dshgit_metaText",
      "inlineChange": "dshgit_inlineChange",
      "tokComment": "dshgit_tokComment",
      "tokKeyword": "dshgit_tokKeyword",
      "tokString": "dshgit_tokString",
      "tokType": "dshgit_tokType",
      "tokNumber": "dshgit_tokNumber",
      "tokFunction": "dshgit_tokFunction",
      "tokMacro": "dshgit_tokMacro",
      "foldRow": "dshgit_foldRow",
      "foldMarker": "dshgit_foldMarker",
      "expand": "dshgit_expand",
      "files": "dshgit_files",
      "fileBlock": "dshgit_fileBlock",
      "file": "dshgit_file",
      "fileChevron": "dshgit_fileChevron",
      "fileChevronExpanded": "dshgit_fileChevronExpanded",
      "filePath": "dshgit_filePath",
      "fileOld": "dshgit_fileOld",
      "fileTag": "dshgit_fileTag",
      "fileStats": "dshgit_fileStats",
      "statAdd": "dshgit_statAdd",
      "statDel": "dshgit_statDel"
    };
  }
});

// src/client/index.tsx
var index_exports = {};
__export(index_exports, {
  apply: () => apply,
  inject: () => inject
});
module.exports = __toCommonJS(index_exports);
var import_react6 = require("react");
var import_dsh_client_ui_primitives3 = require("@deepseek-ai/dsh-client-ui-primitives");

// src/client/locales.ts
var zh = {
  git: "Git",
  guideDescGit: "Git \u72B6\u6001\u3001\u6682\u5B58\u4E0E\u63D0\u4EA4\u3001\u5206\u652F\u4E0E\u5386\u53F2",
  worktree: "\u5DE5\u4F5C\u6811",
  refresh: "\u5237\u65B0",
  loading: "\u52A0\u8F7D\u4E2D\u2026",
  notRepo: "\u5F53\u524D\u76EE\u5F55\u4E0D\u662F git \u4ED3\u5E93",
  statusTruncated: "\u53D8\u66F4\u8FC7\u591A\uFF0C\u4EC5\u663E\u793A\u524D 2000 \u6761",
  staged: "\u5DF2\u6682\u5B58",
  unstageAll: "\u5168\u90E8\u53D6\u6D88\u6682\u5B58",
  noChanges: "\u6CA1\u6709\u53D8\u66F4",
  unstaged: "\u672A\u6682\u5B58",
  stageAll: "\u5168\u90E8\u6682\u5B58",
  commitPlaceholder: "\u63D0\u4EA4\u4FE1\u606F (Ctrl+Enter)",
  commit: "\u63D0\u4EA4",
  history: "\u5386\u53F2",
  loadMore: "\u52A0\u8F7D\u66F4\u591A",
  historyLoadError: "\u52A0\u8F7D\u66F4\u591A\u5386\u53F2\u5931\u8D25",
  checkoutError: "\u5207\u6362\u5206\u652F\u5931\u8D25",
  unstage: "\u53D6\u6D88\u6682\u5B58",
  stage: "\u6682\u5B58",
  discard: "\u653E\u5F03\u66F4\u6539",
  discardAll: "\u5168\u90E8\u56DE\u9000",
  discardAllTitle: "\u56DE\u9000\u5168\u90E8\u672A\u6682\u5B58\u66F4\u6539",
  discardAllDesc: "\u5C06\u91CD\u7F6E {tracked} \u4E2A\u5DF2\u8DDF\u8E2A\u6587\u4EF6\u7684\u5DE5\u4F5C\u533A\u4FEE\u6539\uFF0C\u5E76\u5220\u9664 {untracked} \u4E2A\u672A\u8DDF\u8E2A\u6587\u4EF6\uFF08\u4E0D\u53EF\u6062\u590D\uFF09\u3002",
  deleteFile: "\u5220\u9664\u6587\u4EF6",
  discardUntrackedTitle: "\u5220\u9664\u672A\u8DDF\u8E2A\u6587\u4EF6",
  discardUntrackedDesc: "\u300C{path}\u300D\u8FD8\u6CA1\u6709\u88AB git \u8BB0\u5F55\uFF0C\u56DE\u9000\u5C06\u5220\u9664\u8BE5\u6587\u4EF6\uFF0C\u5185\u5BB9\u65E0\u6CD5\u6062\u590D\u3002",
  discardTitle: "\u653E\u5F03\u66F4\u6539",
  discardDesc: "\u5C06\u4E22\u5F03\u300C{path}\u300D\u7684\u5DE5\u4F5C\u533A\u4FEE\u6539\uFF08\u4E0D\u53EF\u6062\u590D\uFF09\u3002",
  cancel: "\u53D6\u6D88",
  viewCommitDiff: "\u67E5\u770B\u63D0\u4EA4\u5DEE\u5F02",
  copyShortHash: "\u590D\u5236\u77ED\u54C8\u5E0C",
  copyFullHash: "\u590D\u5236\u5B8C\u6574\u54C8\u5E0C",
  copySubject: "\u590D\u5236\u63D0\u4EA4\u4FE1\u606F",
  revertCommit: "\u8FD8\u539F\u6B64\u63D0\u4EA4",
  cherryPickCommit: "\u6361\u53D6\u6B64\u63D0\u4EA4",
  revertTitle: "\u8FD8\u539F\u6B64\u63D0\u4EA4",
  revertDesc: "\u5C06\u5728\u5F53\u524D\u5206\u652F\u521B\u5EFA\u4E00\u4E2A\u53CD\u8F6C\u300C{subject}\u300D\u7684\u65B0\u63D0\u4EA4\u3002",
  cherryPickTitle: "\u6361\u53D6\u6B64\u63D0\u4EA4",
  cherryPickDesc: "\u5C06\u300C{subject}\u300D\u7684\u66F4\u6539\u5E94\u7528\u5230\u5F53\u524D\u5206\u652F\u3002",
  changesClosePreview: "\u5173\u95ED\u9884\u89C8",
  changesError: "\u51FA\u9519",
  copied: "\u5DF2\u590D\u5236",
  copy: "\u590D\u5236",
  diffEmpty: "\u6CA1\u6709\u6587\u672C\u5DEE\u5F02",
  diffLoadError: "\u52A0\u8F7D\u5DEE\u5F02\u5931\u8D25",
  changesResizePreview: "\u8C03\u6574\u9884\u89C8\u9AD8\u5EA6",
  changesContext: "\u4E0A\u4E0B\u6587",
  changesFold: "{count} \u884C\u2026\u70B9\u51FB\u5C55\u5F00",
  changesFoldLoading: "\u5C55\u5F00\u4E2D\u2026",
  changesFoldUnavailable: "\u4E0A\u4E0B\u6587\u672A\u52A0\u8F7D",
  diffExpand: "\u5C55\u5F00\u5176\u4F59 {count} \u884C",
  diffAdded: "\u65B0\u589E",
  diffBinary: "\u4E8C\u8FDB\u5236",
  diffTruncated: "\u6587\u4EF6\u8FC7\u5927\uFF0C\u4EC5\u663E\u793A\u524D 2 MiB\uFF08\u5171 {size}\uFF09",
  diffBinaryNotice: "\u4E8C\u8FDB\u5236\u6587\u4EF6\uFF0C\u65E0\u6CD5\u9884\u89C8\uFF08\u5171 {size}\uFF09",
  diffDeleted: "\u5220\u9664",
  diffRenamed: "\u91CD\u547D\u540D",
  timeJustNow: "\u521A\u521A",
  timeMinutesAgo: "{n} \u5206\u949F\u524D",
  timeHoursAgo: "{n} \u5C0F\u65F6\u524D",
  timeYesterday: "\u6628\u5929"
};
var en = {
  git: "Git",
  guideDescGit: "Git status, staging & commit, branches and history",
  worktree: "Worktree",
  refresh: "Refresh",
  loading: "Loading\u2026",
  notRepo: "This directory is not a git repository",
  statusTruncated: "Too many changes; showing the first 2,000 entries",
  staged: "Staged",
  unstageAll: "Unstage all",
  noChanges: "No changes",
  unstaged: "Unstaged",
  stageAll: "Stage all",
  commitPlaceholder: "Commit message (Ctrl+Enter)",
  commit: "Commit",
  history: "History",
  loadMore: "Load more",
  historyLoadError: "Failed to load more history",
  checkoutError: "Branch switch failed",
  unstage: "Unstage",
  stage: "Stage",
  discard: "Discard changes",
  discardAll: "Discard all",
  discardAllTitle: "Discard all unstaged changes",
  discardAllDesc: "This resets the worktree changes of {tracked} tracked file(s) and deletes {untracked} untracked file(s); not recoverable.",
  deleteFile: "Delete file",
  discardUntrackedTitle: "Delete untracked file",
  discardUntrackedDesc: 'Git does not track "{path}" yet, so discarding it deletes the file; its contents cannot be recovered.',
  discardTitle: "Discard changes",
  discardDesc: 'This discards the worktree changes of "{path}" (not recoverable).',
  cancel: "Cancel",
  viewCommitDiff: "View commit diff",
  copyShortHash: "Copy short hash",
  copyFullHash: "Copy full hash",
  copySubject: "Copy subject",
  revertCommit: "Revert commit",
  cherryPickCommit: "Cherry-pick commit",
  revertTitle: "Revert commit",
  revertDesc: 'Create a new commit on the current branch that reverts "{subject}".',
  cherryPickTitle: "Cherry-pick commit",
  cherryPickDesc: 'Apply the changes of "{subject}" to the current branch.',
  changesClosePreview: "Close preview",
  changesError: "error",
  copied: "Copied",
  copy: "Copy",
  diffEmpty: "No text changes",
  diffLoadError: "Failed to load diff",
  changesResizePreview: "Resize preview",
  changesContext: "context",
  changesFold: "{count} lines\u2026click to expand",
  changesFoldLoading: "Expanding\u2026",
  changesFoldUnavailable: "Context unavailable",
  diffExpand: "Expand {count} more rows",
  diffAdded: "Added",
  diffBinary: "Binary",
  diffTruncated: "File too large: showing the first 2 MiB of {size}",
  diffBinaryNotice: "Binary file: nothing to preview ({size})",
  diffDeleted: "Deleted",
  diffRenamed: "Renamed",
  timeJustNow: "just now",
  timeMinutesAgo: "{n} min ago",
  timeHoursAgo: "{n} h ago",
  timeYesterday: "yesterday"
};
var localeService;
function attachLocale(service) {
  localeService = service;
}
function activeLocale() {
  return localeService?.getSnapshot().active ?? (typeof navigator !== "undefined" ? navigator.language : "") ?? "en";
}
function t(key, params) {
  let text;
  const dict = activeLocale().toLowerCase().startsWith("zh") ? zh : en;
  text = dict[key];
  if (text === void 0) text = key;
  if (params !== void 0) {
    for (const [name, value] of Object.entries(params)) {
      text = text.replaceAll(`{${name}}`, String(value));
    }
  }
  return text;
}
function relativeTime(iso) {
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return iso;
  const seconds = Math.floor((Date.now() - then) / 1e3);
  if (seconds < 60) return t("timeJustNow");
  if (seconds < 3600) return t("timeMinutesAgo", { n: Math.floor(seconds / 60) });
  if (seconds < 86400) return t("timeHoursAgo", { n: Math.floor(seconds / 3600) });
  if (seconds < 172800) return t("timeYesterday");
  const date = new Date(then);
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// src/client/GitPanel.tsx
var import_react2 = require("react");
var import_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");

// src/client/api.ts
var SidebarApiError = class extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
  code;
};
async function readEnvelope(response) {
  const parsed = await response.json().catch(() => null);
  if (!response.ok || parsed === null || parsed.ok !== true || parsed.value === void 0) {
    throw new SidebarApiError(
      parsed?.error?.code ?? "http",
      parsed?.error?.message ?? `HTTP ${response.status}`
    );
  }
  return parsed.value;
}
async function call(method, payload, signal) {
  let response;
  try {
    response = await fetch(`/git-panel/api/${method}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      signal
    });
  } catch (error) {
    throw new SidebarApiError("network", error instanceof Error ? error.message : String(error));
  }
  return readEnvelope(response);
}
function scopePayload(scope, extra) {
  return {
    sessionId: scope.sessionId,
    ...scope.cwd !== void 0 && scope.cwd !== "" ? { cwd: scope.cwd } : {},
    ...scope.repoRoot !== void 0 && scope.repoRoot !== "" ? { repoRoot: scope.repoRoot } : {},
    ...extra
  };
}
function gitPayload(scope, worktree, extra) {
  return scopePayload(scope, { ...worktree !== void 0 && worktree !== "" ? { worktree } : {}, ...extra });
}
var api = {
  gitWorktrees: (scope, signal) => call("git.worktrees", scopePayload(scope, {}), signal),
  gitStatus: (scope, worktree, signal) => call("git.status", gitPayload(scope, worktree, {}), signal),
  gitDiff: (scope, path, staged, worktree, signal) => call("git.diff", gitPayload(scope, worktree, { ...path !== void 0 ? { path } : {}, staged }), signal),
  gitStage: (scope, path, worktree) => call("git.stage", gitPayload(scope, worktree, { ...path !== void 0 ? { path } : {} })),
  gitUnstage: (scope, path, worktree) => call("git.unstage", gitPayload(scope, worktree, { ...path !== void 0 ? { path } : {} })),
  gitCommit: (scope, message, worktree) => call("git.commit", gitPayload(scope, worktree, { message })),
  gitBranch: (scope, worktree, signal) => call("git.branch", gitPayload(scope, worktree, {}), signal),
  gitCheckout: (scope, branch, worktree) => call("git.checkout", gitPayload(scope, worktree, { branch })),
  /** Recent commit history, lazily pageable (skip/count; defaults 0/30). */
  gitLog: (scope, count, skip, worktree, signal) => call("git.log", gitPayload(scope, worktree, {
    ...count !== void 0 ? { count } : {},
    ...skip !== void 0 ? { skip } : {}
  }), signal),
  /** Full patch text of one commit (diff display for the history rows). */
  gitCommitDiff: (scope, hash, worktree, signal) => call("git.commit-diff", gitPayload(scope, worktree, { hash }), signal),
  /** One file's content at a revision (`git show <rev>:<path>`); null when the
   *  revision has no such path. The diff views' on-demand hunk-fold expansion
   *  reads both sides' full contents through this. */
  gitShow: (scope, rev, path, worktree, signal) => call("git.show", gitPayload(scope, worktree, { rev, path }), signal),
  /** One file's text (the untracked full-addition fallback of the diff pane). */
  fsRead: (scope, path, signal) => call("fs.read", scopePayload(scope, { path }), signal),
  /** Discard the worktree changes of one file (the index is untouched). */
  gitDiscard: (scope, path, worktree) => call("git.discard", gitPayload(scope, worktree, { path })),
  /** Revert one commit onto the current branch. */
  gitRevert: (scope, hash, worktree) => call("git.revert", gitPayload(scope, worktree, { hash })),
  /** Cherry-pick one commit onto the current branch. */
  gitCherryPick: (scope, hash, worktree) => call("git.cherry-pick", gitPayload(scope, worktree, { hash }))
};

// src/client/use-polling.ts
var import_react = require("react");
function usePolling(enabled, task, { intervalMs, mode = "fixed-interval", immediate = false }) {
  (0, import_react.useEffect)(() => {
    if (!enabled) return;
    const controller = new AbortController();
    if (mode === "self-scheduling") {
      let disposed = false;
      let timer2;
      const tick = async () => {
        if (disposed) return;
        try {
          await task(controller.signal);
        } catch {
        }
        if (!disposed) timer2 = window.setTimeout(() => {
          void tick();
        }, intervalMs);
      };
      if (immediate) void tick();
      else timer2 = window.setTimeout(() => {
        void tick();
      }, intervalMs);
      return () => {
        disposed = true;
        if (timer2 !== void 0) window.clearTimeout(timer2);
        controller.abort();
      };
    }
    const run = () => {
      task(controller.signal).catch(() => {
      });
    };
    if (immediate) run();
    const timer = window.setInterval(run, intervalMs);
    return () => {
      window.clearInterval(timer);
      controller.abort();
    };
  }, [enabled, task, intervalMs, mode, immediate]);
}

// src/client/paths.ts
function isAbsolutePath(path) {
  return path.startsWith("/") || /^[A-Za-z]:[\\/]/.test(path) || /^[\\/]{2}[^\\/]/.test(path);
}
function baseName(path) {
  const at = Math.max(path.lastIndexOf("/"), path.lastIndexOf("\\"));
  return at === -1 ? path : path.slice(at + 1);
}

// src/client/GitPanel.tsx
var import_changes = __toESM(require_changes(), 1);
var import_jsx_runtime = require("react/jsx-runtime");
function badgeOf(entry) {
  const index = entry.xy[0];
  if (index !== void 0 && index !== " " && index !== "?") return index;
  const worktree = entry.xy[1];
  if (worktree !== void 0 && worktree !== " " && worktree !== "?") return worktree;
  return "?";
}
function isStagedEntry(entry) {
  const index = entry.xy[0];
  return index !== void 0 && index !== " " && index !== "?";
}
function isUnstagedEntry(entry) {
  if (entry.xy === "??") return true;
  const worktree = entry.xy[1];
  return worktree !== void 0 && worktree !== " " && worktree !== "?";
}
function isUntracked(entry) {
  return badgeOf(entry) === "?";
}
function refNames(refs) {
  return [...new Set(
    refs.split(",").map((ref) => ref.trim()).filter((ref) => ref !== "").map((ref) => ref.includes(" -> ") ? ref.slice(ref.indexOf(" -> ") + 4) : ref).map((ref) => ref.startsWith("tag: ") ? ref.slice(5) : ref)
  )];
}
function DiscardGlyph({ size = 16 }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    "svg",
    {
      width: size,
      height: size,
      viewBox: "0 0 16 16",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 1.4,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": "true",
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M5.6 3.2 2.2 6.6l3.4 3.4" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M2.2 6.6h6.6a4.2 4.2 0 0 1 0 8.4H6.6" })
      ]
    }
  );
}
function MinusGlyph({ size = 16 }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "svg",
    {
      width: size,
      height: size,
      viewBox: "0 0 16 16",
      fill: "none",
      "aria-hidden": "true",
      children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M1.5 7.34961H14.5V8.65039H1.5Z", fill: "currentColor" })
    }
  );
}
function errorMessage(reason) {
  return reason instanceof Error ? reason.message : String(reason);
}
var LOG_BATCH = 20;
var WORKTREE_RECHECK_TICKS = 15;
function GitPanel(props) {
  const { scope, onPreview, selectedRef, visible, useStore, actions } = props;
  const view = useStore((state) => state.view);
  const commitMsg = useStore((state) => state.commitMsg);
  const { status, worktrees, selectedWorktree, repoRoot, branchNames, logEntries, logEnded, error } = view;
  const [busy, setBusy] = (0, import_react2.useState)(false);
  const [actionError, setActionError] = (0, import_react2.useState)(null);
  const [logLoadingMore, setLogLoadingMore] = (0, import_react2.useState)(false);
  const [historyMenu, setHistoryMenu] = (0, import_react2.useState)(null);
  const [confirm, setConfirm] = (0, import_react2.useState)(null);
  const refreshInFlight = (0, import_react2.useRef)(false);
  const refreshGeneration = (0, import_react2.useRef)(0);
  const worktreeChosenByUser = (0, import_react2.useRef)(false);
  const chosenPathRef = (0, import_react2.useRef)(void 0);
  (0, import_react2.useEffect)(() => {
    chosenPathRef.current = selectedWorktree;
  }, [selectedWorktree]);
  const silentTickCount = (0, import_react2.useRef)(0);
  const gitScope = repoRoot === void 0 ? scope : { ...scope, repoRoot };
  const refreshTarget = (0, import_react2.useCallback)(async (target, options) => {
    actions.publish({ error: null });
    try {
      const [statusResult, branchResult, logResult] = await Promise.all([
        api.gitStatus(gitScope, target),
        api.gitBranch(gitScope, target).catch(() => ({ current: "", names: [] })),
        api.gitLog(gitScope, LOG_BATCH, 0, target).catch(() => [])
      ]);
      if (options.generation !== refreshGeneration.current) return;
      actions.publish({
        status: statusResult,
        branchNames: branchResult.names,
        logEntries: logResult,
        logEnded: logResult.length < LOG_BATCH,
        error: null,
        ...statusResult.root !== void 0 && statusResult.root !== repoRoot ? { repoRoot: statusResult.root } : {}
      });
    } catch (reason) {
      if (options.generation === refreshGeneration.current) {
        actions.publish({ error: errorMessage(reason) });
      }
    }
  }, [scope.sessionId, scope.cwd, repoRoot]);
  const refresh = (0, import_react2.useCallback)(async (silent = false) => {
    if (refreshInFlight.current) return;
    refreshInFlight.current = true;
    let generation = refreshGeneration.current;
    try {
      if (silent && chosenPathRef.current !== void 0 && (silentTickCount.current += 1) % WORKTREE_RECHECK_TICKS !== 0) {
        const statusResult = await api.gitStatus(gitScope, chosenPathRef.current);
        if (generation === refreshGeneration.current) actions.publish({ status: statusResult });
        return;
      }
      silentTickCount.current = 0;
      const listed = await api.gitWorktrees(scope);
      if (generation !== refreshGeneration.current) return;
      actions.publish({ worktrees: listed });
      const selectedStillExists = listed.some((entry) => entry.path === chosenPathRef.current);
      let target = selectedStillExists ? chosenPathRef.current : listed.find((entry) => entry.current)?.path;
      const current = listed.find((entry) => entry.current);
      const dirtyLinked = listed.filter((entry) => !entry.current && entry.changes > 0);
      if (!worktreeChosenByUser.current) {
        target = (current?.changes ?? 0) === 0 && dirtyLinked.length === 1 ? dirtyLinked[0].path : current?.path;
      }
      const targetChanged = target !== chosenPathRef.current;
      if (targetChanged) {
        generation = refreshGeneration.current += 1;
        chosenPathRef.current = target;
        actions.publish({
          selectedWorktree: target,
          status: null,
          branchNames: [],
          logEntries: [],
          logEnded: false
        });
        setLogLoadingMore(false);
      }
      if (silent && !targetChanged) {
        const statusResult = await api.gitStatus(gitScope, target);
        if (generation === refreshGeneration.current) actions.publish({ status: statusResult });
        return;
      }
      await refreshTarget(target, { generation });
    } catch (reason) {
      if (generation === refreshGeneration.current) {
        actions.publish({ error: errorMessage(reason) });
      }
    } finally {
      refreshInFlight.current = false;
    }
  }, [scope.sessionId, scope.cwd, refreshTarget]);
  const scopeKey = `${scope.sessionId}\0${scope.cwd ?? ""}`;
  const storedScopeKey = useStore((state) => state.scopeKey);
  (0, import_react2.useEffect)(() => {
    if (storedScopeKey === scopeKey) return;
    refreshGeneration.current += 1;
    refreshInFlight.current = false;
    worktreeChosenByUser.current = false;
    chosenPathRef.current = void 0;
    silentTickCount.current = 0;
    actions.resetScope(scopeKey);
  }, [scopeKey, storedScopeKey]);
  (0, import_react2.useEffect)(() => {
    void refresh();
  }, [refresh]);
  const chooseWorktree = (target) => {
    worktreeChosenByUser.current = true;
    chosenPathRef.current = target;
    actions.publish({
      selectedWorktree: target,
      status: null,
      branchNames: [],
      logEntries: [],
      logEnded: false
    });
    setLogLoadingMore(false);
    const generation = refreshGeneration.current += 1;
    void refreshTarget(target, { generation });
  };
  const chooseRepo = (target) => {
    actions.publish({
      repoRoot: target,
      status: null,
      branchNames: [],
      logEntries: [],
      logEnded: false
    });
    setLogLoadingMore(false);
    const generation = refreshGeneration.current += 1;
    void refreshTarget(chosenPathRef.current ?? "", { generation });
  };
  const pollTick = (0, import_react2.useCallback)(() => refresh(true), [refresh]);
  usePolling(visible, pollTick, { intervalMs: 2e3 });
  const loadMoreLog = async () => {
    if (logLoadingMore || logEnded) return;
    const generation = refreshGeneration.current;
    const target = chosenPathRef.current;
    setLogLoadingMore(true);
    try {
      const next = await api.gitLog(gitScope, LOG_BATCH, logEntries.length, target);
      if (generation !== refreshGeneration.current || target !== chosenPathRef.current) return;
      actions.publish({
        logEntries: [...logEntries, ...next],
        ...next.length < LOG_BATCH ? { logEnded: true } : {}
      });
    } catch (reason) {
      if (generation === refreshGeneration.current && target === chosenPathRef.current) {
        setActionError(`${t("historyLoadError")}: ${errorMessage(reason)}`);
      }
    } finally {
      if (generation === refreshGeneration.current && target === chosenPathRef.current) setLogLoadingMore(false);
    }
  };
  const worktreeRefOf = (entry, staged) => ({
    kind: "worktree",
    path: entry.path,
    staged,
    untracked: isUntracked(entry),
    worktree: selectedWorktree,
    repoRoot
  });
  const commitRefOf = (entry) => ({
    kind: "commit",
    hash: entry.hash,
    hashFull: entry.hashFull,
    subject: entry.subject,
    worktree: selectedWorktree,
    repoRoot
  });
  const isPreviewedWorktree = (entry, staged) => {
    if (selectedRef === null || selectedRef.kind !== "worktree") return false;
    return selectedRef.path === entry.path && selectedRef.staged === staged && (selectedRef.worktree ?? "") === (selectedWorktree ?? "");
  };
  const stageEntry = async (entry, staged) => {
    setBusy(true);
    setActionError(null);
    try {
      if (staged) await api.gitUnstage(gitScope, entry.path, selectedWorktree);
      else await api.gitStage(gitScope, entry.path, selectedWorktree);
      await refresh();
    } catch (reason) {
      setActionError(errorMessage(reason));
    } finally {
      setBusy(false);
    }
  };
  const stageAll = async (staged) => {
    setBusy(true);
    setActionError(null);
    try {
      if (staged) await api.gitUnstage(gitScope, void 0, selectedWorktree);
      else await api.gitStage(gitScope, void 0, selectedWorktree);
      await refresh();
    } catch (reason) {
      setActionError(errorMessage(reason));
    } finally {
      setBusy(false);
    }
  };
  const discardEntry = (entry) => {
    const untracked = isUntracked(entry);
    runConfirmed({
      title: untracked ? t("discardUntrackedTitle") : t("discardTitle"),
      description: untracked ? t("discardUntrackedDesc", { path: entry.path }) : t("discardDesc", { path: entry.path }),
      confirmLabel: untracked ? t("deleteFile") : t("discard"),
      onConfirm: () => api.gitDiscard(gitScope, entry.path, selectedWorktree)
    });
  };
  const discardAll = () => {
    const tracked = unstagedEntries.filter((entry) => !isUntracked(entry)).length;
    const untracked = unstagedEntries.filter((entry) => isUntracked(entry)).length;
    runConfirmed({
      title: t("discardAllTitle"),
      description: t("discardAllDesc", { tracked, untracked }),
      confirmLabel: t("discardAll"),
      onConfirm: async () => {
        for (const entry of unstagedEntries) {
          await api.gitDiscard(gitScope, entry.path, selectedWorktree);
        }
      }
    });
  };
  const commit = async () => {
    const message = commitMsg.trim();
    if (message === "" || busy) return;
    setBusy(true);
    setActionError(null);
    try {
      await api.gitCommit(gitScope, message, selectedWorktree);
      actions.setCommitMsg("");
      await refresh();
    } catch (reason) {
      setActionError(errorMessage(reason));
    } finally {
      setBusy(false);
    }
  };
  const checkout = async (branch) => {
    if (branch === status?.branch || busy) return;
    setBusy(true);
    setActionError(null);
    try {
      await api.gitCheckout(gitScope, branch, selectedWorktree);
      await refresh();
    } catch (reason) {
      setActionError(`${t("checkoutError")}: ${errorMessage(reason)}`);
    } finally {
      setBusy(false);
    }
  };
  const runConfirmed = (confirmState) => {
    setConfirm({ ...confirmState, onConfirm: async () => {
      setBusy(true);
      setActionError(null);
      try {
        await confirmState.onConfirm();
        await refresh();
      } catch (reason) {
        setActionError(errorMessage(reason));
      } finally {
        setBusy(false);
      }
    } });
  };
  const copy = (text) => {
    void (0, import_dsh_client_ui_primitives.writeClipboard)(text);
  };
  const openHistoryMenu = (event, entry) => {
    event.preventDefault();
    event.stopPropagation();
    setHistoryMenu({ entry, x: event.clientX, y: event.clientY });
  };
  const stagedEntries = (status?.entries ?? []).filter(isStagedEntry);
  const unstagedEntries = (status?.entries ?? []).filter(isUnstagedEntry);
  const renderEntry = (entry, staged) => {
    const selected = isPreviewedWorktree(entry, staged);
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      "div",
      {
        className: import_changes.default.gitRow,
        "data-selected": selected ? "true" : void 0,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
            "button",
            {
              type: "button",
              className: import_changes.default.gitRowMain,
              title: entry.path,
              onClick: () => {
                onPreview(worktreeRefOf(entry, staged));
              },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: import_changes.default.gitBadge, "data-letter": badgeOf(entry), children: badgeOf(entry) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: import_changes.default.gitName, children: entry.path })
              ]
            }
          ),
          !staged && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "button",
            {
              type: "button",
              className: import_changes.default.iconButton,
              "data-danger": "true",
              "aria-label": isUntracked(entry) ? t("deleteFile") : t("discard"),
              title: isUntracked(entry) ? t("deleteFile") : t("discard"),
              disabled: busy,
              onClick: () => {
                discardEntry(entry);
              },
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DiscardGlyph, {})
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "button",
            {
              type: "button",
              className: import_changes.default.iconButton,
              "aria-label": staged ? t("unstage") : t("stage"),
              title: staged ? t("unstage") : t("stage"),
              disabled: busy,
              onClick: () => {
                void stageEntry(entry, staged);
              },
              children: staged ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MinusGlyph, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.IconPlusOutline16, {})
            }
          )
        ]
      },
      `${staged ? "s" : "u"}:${entry.path}`
    );
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: import_changes.default.git, children: [
    worktrees.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: import_changes.default.gitWorktreeRow, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: import_changes.default.gitWorktreeLabel, children: t("worktree") }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "select",
        {
          className: import_changes.default.gitBranchSelect,
          value: selectedWorktree ?? "",
          title: selectedWorktree,
          disabled: busy,
          onChange: (event) => {
            chooseWorktree(event.target.value);
          },
          children: worktrees.map((entry) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", { value: entry.path, children: [
            entry.branch,
            " \xB7 ",
            baseName(entry.path),
            " (",
            entry.changes,
            ")"
          ] }, entry.path))
        }
      )
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: import_changes.default.gitHeader, children: [
      (status?.repositories?.length ?? 0) > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "select",
        {
          className: import_changes.default.gitBranchSelect,
          value: repoRoot ?? "",
          title: repoRoot,
          onChange: (event) => {
            chooseRepo(event.target.value);
          },
          disabled: busy,
          children: status.repositories.map((root) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: root, children: baseName(root) }, root))
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
        "select",
        {
          className: import_changes.default.gitBranchSelect,
          value: status?.branch ?? "",
          onChange: (event) => {
            void checkout(event.target.value);
          },
          disabled: busy || status !== null && !status.isRepo,
          children: [
            (status?.branch ?? "") !== "" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: status.branch, children: status.branch }),
            branchNames.filter((name) => name !== status?.branch).map((name) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: name, children: name }, name))
          ]
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "button",
        {
          type: "button",
          className: import_changes.default.iconButton,
          "aria-label": t("refresh"),
          title: t("refresh"),
          onClick: () => {
            void refresh();
          },
          children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.IconRefreshOutline16, { size: 14 })
        }
      )
    ] }),
    error !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: import_changes.default.gitError, children: error }),
    error === null && status !== null && !status.isRepo && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: import_changes.default.gitPlaceholder, children: t("notRepo") }),
    status !== null && status.isRepo && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
      status.truncated === true && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: import_changes.default.gitEmpty, children: t("statusTruncated") }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: import_changes.default.gitSection, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: import_changes.default.gitSectionHeader, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
            t("staged"),
            " (",
            stagedEntries.length,
            ")"
          ] }),
          stagedEntries.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: import_changes.default.gitLink, disabled: busy, onClick: () => {
            void stageAll(true);
          }, children: t("unstageAll") })
        ] }),
        stagedEntries.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: import_changes.default.gitEmpty, children: t("noChanges") }),
        stagedEntries.map((entry) => renderEntry(entry, true))
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: import_changes.default.gitSection, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: import_changes.default.gitSectionHeader, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
            t("unstaged"),
            " (",
            unstagedEntries.length,
            ")"
          ] }),
          unstagedEntries.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: import_changes.default.gitSectionActions, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: import_changes.default.gitLink, "data-danger": "true", disabled: busy, onClick: () => {
              discardAll();
            }, children: t("discardAll") }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: import_changes.default.gitLink, disabled: busy, onClick: () => {
              void stageAll(false);
            }, children: t("stageAll") })
          ] })
        ] }),
        unstagedEntries.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: import_changes.default.gitEmpty, children: t("noChanges") }),
        unstagedEntries.map((entry) => renderEntry(entry, false))
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: import_changes.default.gitCommit, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          import_dsh_client_ui_primitives.Input,
          {
            className: import_changes.default.gitCommitInput,
            placeholder: t("commitPlaceholder"),
            value: commitMsg,
            disabled: busy,
            onChange: (event) => {
              actions.setCommitMsg(event.target.value);
              setActionError(null);
            },
            onKeyDown: (event) => {
              if ((event.ctrlKey || event.metaKey) && event.key === "Enter") void commit();
            }
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "button",
          {
            type: "button",
            className: import_changes.default.gitCommitButton,
            disabled: busy || commitMsg.trim() === "" || stagedEntries.length === 0,
            onClick: () => {
              void commit();
            },
            children: t("commit")
          }
        )
      ] }),
      actionError !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: import_changes.default.gitError, children: actionError }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: import_changes.default.gitSection, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: import_changes.default.gitSectionHeader, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t("history") }) }),
        logEntries.map((entry) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
          "div",
          {
            role: "button",
            tabIndex: 0,
            className: import_changes.default.gitLogRow,
            "data-selected": selectedRef?.kind === "commit" && selectedRef.hashFull === entry.hashFull ? "true" : void 0,
            title: `${entry.author} \xB7 ${entry.date}
${entry.hashFull}`,
            onClick: () => {
              onPreview(commitRefOf(entry));
            },
            onKeyDown: (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onPreview(commitRefOf(entry));
              }
            },
            onContextMenu: (event) => {
              openHistoryMenu(event, entry);
            },
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: import_changes.default.gitLogLine1, children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: import_changes.default.gitLogHash, children: entry.hash }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: import_changes.default.gitLogSubject, children: entry.subject })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: import_changes.default.gitLogLine2, children: [
                refNames(entry.refs).map((ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: import_changes.default.gitLogRef, children: ref }, ref)),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: import_changes.default.gitLogMeta, children: [
                  entry.author,
                  " \xB7 ",
                  relativeTime(entry.date)
                ] })
              ] })
            ]
          },
          entry.hashFull
        )),
        !logEnded && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "button",
          {
            type: "button",
            className: import_changes.default.gitLogMore,
            disabled: logLoadingMore || busy,
            onClick: () => {
              void loadMoreLog();
            },
            children: logLoadingMore ? t("loading") : t("loadMore")
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_dsh_client_ui_primitives.Menu,
        {
          open: historyMenu !== null,
          onClose: () => {
            setHistoryMenu(null);
          },
          items: [
            { id: "view", label: t("viewCommitDiff") },
            { id: "copyShort", label: t("copyShortHash"), icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.IconCopyOutline16, { size: 14 }) },
            { id: "copyFull", label: t("copyFullHash"), icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.IconCopyOutline16, { size: 14 }) },
            { id: "copySubject", label: t("copySubject"), icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.IconCopyOutline16, { size: 14 }) },
            { type: "separator", id: "sep2" },
            { id: "revert", label: t("revertCommit"), danger: true },
            { id: "cherryPick", label: t("cherryPickCommit"), danger: true }
          ],
          onSelect: (id) => {
            const target = historyMenu;
            if (target === null) return;
            setHistoryMenu(null);
            if (id === "view") {
              onPreview(commitRefOf(target.entry));
              return;
            }
            if (id === "copyShort") {
              copy(target.entry.hash);
              return;
            }
            if (id === "copyFull") {
              copy(target.entry.hashFull);
              return;
            }
            if (id === "copySubject") {
              copy(target.entry.subject);
              return;
            }
            if (id === "revert") {
              runConfirmed({
                title: t("revertTitle"),
                description: t("revertDesc", { subject: target.entry.subject }),
                confirmLabel: t("revertCommit"),
                onConfirm: () => api.gitRevert(gitScope, target.entry.hashFull, selectedWorktree)
              });
              return;
            }
            if (id === "cherryPick") {
              runConfirmed({
                title: t("cherryPickTitle"),
                description: t("cherryPickDesc", { subject: target.entry.subject }),
                confirmLabel: t("cherryPickCommit"),
                onConfirm: () => api.gitCherryPick(gitScope, target.entry.hashFull, selectedWorktree)
              });
            }
          },
          portal: true,
          compact: true,
          align: "start",
          getAnchorRect: () => historyMenu === null ? null : new DOMRect(historyMenu.x, historyMenu.y, 0, 0),
          anchor: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {})
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        import_dsh_client_ui_primitives.Modal,
        {
          open: confirm !== null,
          onClose: () => {
            setConfirm(null);
          },
          title: confirm?.title ?? "",
          closeLabel: t("cancel"),
          footer: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.Button, { variant: "outline", onClick: () => {
              setConfirm(null);
            }, children: t("cancel") }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              import_dsh_client_ui_primitives.Button,
              {
                variant: "primary",
                disabled: busy,
                onClick: () => {
                  const pending = confirm;
                  if (pending === null) return;
                  setConfirm(null);
                  void pending.onConfirm();
                },
                children: confirm?.confirmLabel ?? ""
              }
            )
          ] }),
          children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: import_changes.default.gitConfirmDesc, children: confirm?.description })
        }
      )
    ] })
  ] });
}

// src/client/GitDiffPane.tsx
var import_react5 = require("react");
var import_dsh_client_ui_primitives2 = require("@deepseek-ai/dsh-client-ui-primitives");

// src/client/sidebar-path.ts
function resolveSidebarPath(cwd, path) {
  if (isAbsolutePath(path)) return path;
  const base = cwd ?? "";
  if (base === "") return path;
  const separator = base.includes("\\") ? "\\" : "/";
  return `${base.replace(/[\\/]+$/, "")}${separator}${path}`;
}

// src/client/diff/DiffFiles.tsx
var import_react4 = require("react");

// node_modules/clsx/dist/clsx.mjs
function r(e) {
  var t2, f, n = "";
  if ("string" == typeof e || "number" == typeof e) n += e;
  else if ("object" == typeof e) if (Array.isArray(e)) {
    var o = e.length;
    for (t2 = 0; t2 < o; t2++) e[t2] && (f = r(e[t2])) && (n && (n += " "), n += f);
  } else for (f in e) e[f] && (n && (n += " "), n += f);
  return n;
}
function clsx() {
  for (var e, t2, f = 0, n = "", o = arguments.length; f < o; f++) (e = arguments[f]) && (t2 = r(e)) && (n && (n += " "), n += t2);
  return n;
}
var clsx_default = clsx;

// src/client/diff/rows.ts
function pairMods(rows) {
  const out = rows.slice();
  let k = 0;
  while (k < out.length) {
    if (out[k].kind !== "del") {
      k += 1;
      continue;
    }
    const delStart = k;
    while (k < out.length && out[k].kind === "del") k += 1;
    const addStart = k;
    while (k < out.length && out[k].kind === "add") k += 1;
    const pairs = Math.min(addStart - delStart, k - addStart);
    for (let p = 0; p < pairs; p += 1) {
      out[delStart + p] = { ...out[delStart + p], kind: "mod" };
      out[addStart + p] = { ...out[addStart + p], kind: "mod" };
    }
  }
  return out;
}
var MIN_FOLD = 3;
function diffInline(oldText, newText) {
  const minLen = Math.min(oldText.length, newText.length);
  let prefix = 0;
  while (prefix < minLen && oldText[prefix] === newText[prefix]) prefix += 1;
  let suffix = 0;
  while (suffix < minLen - prefix && oldText[oldText.length - 1 - suffix] === newText[newText.length - 1 - suffix]) suffix += 1;
  const oldMidStart = prefix;
  const oldMidEnd = oldText.length - suffix;
  const newMidStart = prefix;
  const newMidEnd = newText.length - suffix;
  const segments = (text, midStart, midEnd) => {
    const out = [];
    if (midStart > 0) out.push({ text: text.slice(0, midStart), changed: false });
    const mid = text.slice(midStart, midEnd);
    if (mid.length > 0) out.push({ text: mid, changed: true });
    if (midEnd < text.length) out.push({ text: text.slice(midEnd), changed: false });
    return out;
  };
  return { old: segments(oldText, oldMidStart, oldMidEnd), next: segments(newText, newMidStart, newMidEnd) };
}
function coalesceInline(segments) {
  const out = [];
  for (const seg of segments) {
    const last = out[out.length - 1];
    if (last !== void 0 && last.changed === seg.changed) out[out.length - 1] = { text: last.text + seg.text, changed: seg.changed };
    else out.push(seg);
  }
  return out;
}
function parseHunkHeader(line) {
  const match = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@(.*)$/.exec(line);
  if (match === null) return null;
  return { oldStart: Number(match[1]), newStart: Number(match[3]), header: match[5] ?? "" };
}
function parseUnifiedDiff(text) {
  const files = [];
  let current = null;
  let inHunk = false;
  let hunk = null;
  let oldNum = 0;
  let newNum = 0;
  const flushHunk = () => {
    if (current !== null && hunk !== null) current.hunks.push(hunk);
    hunk = null;
    inHunk = false;
  };
  for (const raw of text.split("\n")) {
    if (raw.startsWith("diff --git ")) {
      flushHunk();
      current = { oldPath: "", newPath: "", binary: false, hunks: [] };
      files.push(current);
      continue;
    }
    if (current === null) continue;
    if (raw.startsWith("Binary files ") || raw === "GIT binary patch") {
      flushHunk();
      current.binary = true;
      continue;
    }
    if (raw.startsWith("--- ")) {
      flushHunk();
      current.oldPath = raw.slice(4);
      continue;
    }
    if (raw.startsWith("+++ ")) {
      current.newPath = raw.slice(4);
      continue;
    }
    const header = parseHunkHeader(raw);
    if (header !== null) {
      flushHunk();
      hunk = { oldStart: header.oldStart, newStart: header.newStart, header: header.header, lines: [] };
      oldNum = header.oldStart;
      newNum = header.newStart;
      inHunk = true;
      continue;
    }
    if (!inHunk || hunk === null) continue;
    const marker = raw[0];
    if (marker === "\\") {
      hunk.lines.push({ kind: "meta", text: raw.slice(1), oldNum: null, newNum: null });
      continue;
    }
    if (marker === " ") {
      hunk.lines.push({ kind: "ctx", text: raw.slice(1), oldNum, newNum });
      oldNum += 1;
      newNum += 1;
    } else if (marker === "-") {
      hunk.lines.push({ kind: "del", text: raw.slice(1), oldNum, newNum: null });
      oldNum += 1;
    } else if (marker === "+") {
      hunk.lines.push({ kind: "add", text: raw.slice(1), oldNum: null, newNum });
      newNum += 1;
    } else {
      flushHunk();
    }
  }
  flushHunk();
  return { files };
}
function rowOfLine(line) {
  if (line.kind === "meta") return { kind: "meta", text: line.text };
  const kind = line.kind === "ctx" ? "context" : line.kind;
  if (line.kind === "del") return { kind, oldLine: line.oldNum ?? void 0, text: line.text };
  if (line.kind === "add") return { kind, newLine: line.newNum ?? void 0, text: line.text };
  return { kind, oldLine: line.oldNum ?? void 0, newLine: line.newNum ?? void 0, text: line.text };
}
function unifiedSegments(file) {
  const segments = [];
  file.hunks.forEach((hunk, index) => {
    const rows = pairMods(hunk.lines.map(rowOfLine));
    const prev = file.hunks[index - 1];
    if (prev !== void 0) {
      const prevOldEnd = prev.oldStart + prev.lines.filter((line) => line.oldNum !== null).length - 1;
      const prevNewEnd = prev.newStart + prev.lines.filter((line) => line.newNum !== null).length - 1;
      const oldGap = hunk.oldStart - prevOldEnd - 1;
      const newGap = hunk.newStart - prevNewEnd - 1;
      if (oldGap > 0 || newGap > 0) {
        segments.push({
          kind: "fold",
          count: Math.max(oldGap, newGap, 0),
          oldStart: prevOldEnd + 1,
          oldEnd: Math.max(hunk.oldStart - 1, prevOldEnd),
          newStart: prevNewEnd + 1,
          newEnd: Math.max(hunk.newStart - 1, prevNewEnd)
        });
      }
    } else if (hunk.oldStart > 1 || hunk.newStart > 1) {
      segments.push({
        kind: "fold",
        count: Math.max(hunk.oldStart - 1, hunk.newStart - 1, 0),
        oldStart: 1,
        oldEnd: hunk.oldStart - 1,
        newStart: 1,
        newEnd: hunk.newStart - 1
      });
    }
    segments.push({ kind: "hunk", rows });
  });
  return segments;
}
function untrackedFile(path, content) {
  const lines = [];
  const body = content.endsWith("\n") ? content.slice(0, -1) : content;
  if (body !== "") {
    let num = 1;
    for (const line of body.split("\n")) {
      lines.push({ kind: "add", text: line, oldNum: null, newNum: num });
      num += 1;
    }
  }
  return { oldPath: "/dev/null", newPath: `b/${path}`, binary: false, hunks: [{ oldStart: 0, newStart: 1, header: "", lines }] };
}
function foldRowsFromContents(fold, oldContent, newContent) {
  const oldLines = oldContent.length === 0 ? [] : oldContent.split("\n");
  const newLines = newContent.length === 0 ? [] : newContent.split("\n");
  const offset = fold.newStart - fold.oldStart;
  const rows = [];
  const oldFrom = Math.max(fold.oldStart, 1);
  const oldTo = Math.min(fold.oldEnd, oldLines.length);
  for (let oldLine = oldFrom; oldLine <= oldTo; oldLine += 1) {
    const text = oldLines[oldLine - 1];
    const newLine = oldLine + offset;
    rows.push(
      newLine >= fold.newStart && newLine <= fold.newEnd && newLine <= newLines.length ? { kind: "context", oldLine, newLine, text } : { kind: "context", oldLine, text }
    );
  }
  const newFrom = Math.max(fold.newStart, 1);
  const newTo = Math.min(fold.newEnd, newLines.length);
  for (let newLine = Math.max(newFrom, oldTo + offset + 1); newLine <= newTo; newLine += 1) {
    rows.push({ kind: "add", newLine, text: newLines[newLine - 1] });
  }
  return rows;
}
function displayPath(path) {
  if (path === "/dev/null") return path;
  if (path.startsWith("a/") || path.startsWith("b/")) return path.slice(2);
  return path;
}
function diffStats(segments) {
  let added = 0;
  let deleted = 0;
  for (const segment of segments) {
    if (segment.kind !== "hunk") continue;
    for (const row of segment.rows) {
      if (row.kind === "add" || row.kind === "mod") added += 1;
      if (row.kind === "del" || row.kind === "mod") deleted += 1;
    }
  }
  return { added, deleted };
}

// src/client/diff/highlight.ts
var COLORED = /* @__PURE__ */ new Set(["comment", "string", "keyword", "number", "type", "function", "macro"]);
var LETTER = /[A-Za-z_$]/u;
var WORD = /[A-Za-z0-9_$]/u;
var ANYWORD = { wordStart: LETTER, wordBody: WORD };
var kw = (words) => new Set(words.split(/\s+/));
var C_FAMILY = (words) => ({
  lineComments: ["//"],
  blockComment: ["/*", "*/"],
  strings: ['"', "'", "`"],
  keywords: kw(words),
  constants: kw("true false null NULL nullptr TRUE FALSE"),
  macro: true,
  ...ANYWORD
});
var HASH_FAMILY = (words, constants = "") => ({
  lineComments: ["#"],
  strings: ['"', "'"],
  keywords: kw(words),
  constants: kw(constants.length > 0 ? constants : "True False None true false null"),
  macro: false,
  ...ANYWORD
});
var CONFIG_LANG = {
  lineComments: ["#"],
  strings: ['"', "'"],
  keywords: /* @__PURE__ */ new Set(),
  constants: /* @__PURE__ */ new Set(),
  macro: false,
  wordStart: LETTER,
  wordBody: WORD
};
var SQL_LANG = {
  lineComments: ["--", "#"],
  strings: ["'"],
  keywords: kw(`select from where insert into values update set delete create table drop alter add column
    primary key foreign references index view join inner left right outer on as order by group having
    limit offset distinct union all and or not in exists between like is null asc desc count sum avg
    min max case when then else end begin commit rollback transaction default constraint unique`),
  constants: kw("true false null"),
  macro: false,
  ...ANYWORD
};
var CMD_LANG = {
  lineComments: ["::"],
  strings: ['"'],
  keywords: kw(`rem if else for in do goto call exit echo set setlocal endlocal shift
    exist defined errorlevel not equ neq lss leq gtr geq nul con defined enabledelayedexpansion`),
  constants: /* @__PURE__ */ new Set(),
  macro: false,
  wordStart: LETTER,
  wordBody: WORD
};
var PS_LANG = {
  lineComments: ["#"],
  blockComment: ["<#", "#>"],
  strings: ['"', "'"],
  keywords: kw(`function param begin process end if elseif else foreach for while do until switch
    try catch finally throw return break continue filter in workflow class enum interface
    dynamicparam data checkpoint systemlanguage default expand`),
  constants: kw("true false null"),
  macro: false,
  ...ANYWORD
};
var MD_LANG = {
  lineComments: [],
  strings: [],
  keywords: /* @__PURE__ */ new Set(),
  constants: /* @__PURE__ */ new Set(),
  macro: false,
  wordStart: LETTER,
  wordBody: WORD
};
var JS_WORDS = `async await break case catch class const continue debugger default delete do else
  export extends false finally for from function get if implements import in instanceof interface
  let new null of return set static super switch this throw true try typeof undefined var void
  while with yield`;
var TS_WORDS = `abstract any as asserts async await boolean break case catch class const constructor
  continue debugger declare default delete do else enum export extends false finally for from
  function get if implements import in infer instanceof interface is keyof let module namespace
  never new null number object of override private protected public readonly return satisfies set
  static string super switch symbol this throw true try type typeof undefined union unknown var
  void while with yield`;
var CSS_LANG = {
  lineComments: [],
  blockComment: ["/*", "*/"],
  strings: ['"', "'"],
  keywords: kw(`media import charset keyframes font-face supports page namespace layer scope container
    property value at-rule when and not only from to important
    background background-color background-image background-position background-size
    border border-radius border-color border-width border-style bottom box-shadow box-sizing
    color content cursor clip clip-path clear display direction
    flex flex-direction flex-wrap flex-flow flex-grow flex-shrink flex-basis
    font font-family font-size font-style font-weight float fill
    grid grid-area grid-template grid-template-columns grid-template-rows grid-gap gap
    height left letter-spacing line-height list-style margin margin-top margin-right
    margin-bottom margin-left max-height max-width min-height min-width opacity order
    outline overflow padding padding-top padding-right padding-bottom padding-left
    position pointer-events right rotate scale translate transform transform-origin
    text-align text-decoration text-transform top transition transition-property
    user-select vertical-align visibility white-space width word-break word-spacing z-index
    align-items align-content align-self justify-content justify-items justify-self
    aspect-ratio inset object-fit object-position resize scroll-behavior filter backdrop-filter
    animation animation-name animation-duration animation-timing-function animation-delay
    will-change
    html body p a div span li ul ol table tr td th form input button label select textarea img
    section header footer main nav article aside h1 h2 h3 h4 h5 h6 i b em strong small pre code
    inherit initial unset auto none fixed absolute relative sticky static flex block inline
    inline-block inline-flex grid hidden visible bold normal root var calc env`),
  constants: /* @__PURE__ */ new Set(),
  macro: false,
  wordStart: /[A-Za-z-]/u,
  wordBody: /[A-Za-z0-9-]/u
};
var MARKUP_LANG = {
  lineComments: [],
  blockComment: ["<!--", "-->"],
  strings: ['"', "'"],
  keywords: kw(`html head body title meta link script style template slot
    div span p a img ul ol li table thead tbody tr th td form input button label select
    option textarea header footer main nav section article aside figure figcaption
    h1 h2 h3 h4 h5 h6 strong em b i u s small br hr pre code blockquote
    svg path circle rect line polyline polygon g defs use text symbol
    xml doctype class id href src type value name content charset async defer
    vue component props setup script-style export import v-if v-for v-bind v-on`),
  constants: /* @__PURE__ */ new Set(),
  macro: false,
  wordStart: LETTER,
  wordBody: WORD
};
var LANGS = {
  ts: C_FAMILY(TS_WORDS),
  tsx: C_FAMILY(TS_WORDS),
  js: C_FAMILY(JS_WORDS),
  jsx: C_FAMILY(JS_WORDS),
  json: CONFIG_LANG,
  py: HASH_FAMILY(`and as assert async await break class continue def del elif else except finally
    for from global if import in is lambda nonlocal not or pass raise return try while with yield
    match case`, "True False None self cls NotImplemented __name__ __main__"),
  go: C_FAMILY(`break case chan const continue default defer else fallthrough for func go goto if
    import interface map package range return select struct switch type var nil iota make new len
    cap append copy close delete panic print println recover`),
  rs: C_FAMILY(`as async await break const continue crate dyn else enum extern false fn for if impl
    in let loop match mod move mut pub ref return self Self static struct super trait true type
    unsafe use where while`),
  java: C_FAMILY(`abstract assert boolean break byte case catch char class const continue default do
    double else enum extends final finally float for goto if implements import instanceof int
    interface long native new package private protected public return short static strictfp super
    switch synchronized this throw throws transient try void volatile while var record sealed
    permits yield`),
  c: C_FAMILY(`auto break case char const continue default do double else enum extern float for
    goto if inline int long register restrict return short signed sizeof static struct switch
    typedef union unsigned void volatile while _Bool _Complex _Atomic`),
  cpp: C_FAMILY(`alignas alignof and auto break case catch char class co_await co_return co_yield
    concept const consteval constexpr constinit const_cast continue decltype default delete
    do double dynamic_cast else enum explicit export extern false final float for friend goto if
    inline int long mutable namespace new noexcept not nullptr operator or override private
    protected public register reinterpret_cast requires return short signed sizeof static
    static_assert static_cast struct switch template this thread_local throw true try typedef
    typeid typename union unsigned using virtual void volatile wchar_t while`),
  cs: C_FAMILY(`abstract as async await base bool break byte case catch char checked class const
    continue decimal default delegate do double dynamic else enum event explicit extern false
    finally fixed float for foreach get goto if implicit in init int interface internal is lock
    long namespace new null not null forgiving object operator out override params partial
    private protected public readonly record ref return sbyte sealed set short sizeof stackalloc
    static string struct switch this throw true try typeof uint ulong unchecked unsafe ushort
    using var virtual void volatile when where while with yield`),
  kt: C_FAMILY(`as break by catch class companion const constructor continue crossinline data do
    dynamic else enum external false final finally for fun get if import in infix init inline
    interface internal is lateinit lazy null object open operator out override package private
    protected public reified return sealed set super suspend tailrec this throw true try typealias
    val var vararg when where while`),
  swift: C_FAMILY(`actor as associatedtype async await break case catch class continue
    convenience default defer deinit didSet do dynamic else enum extension fallthrough false
    final for func get guard if import in indirect infix init inout internal is lazy let nil
    nonmutating open operator optional override postfix precedencegroup prefix private protocol
    public repeat required rethrows return self set some static struct subscript super switch
    throw throws true try typealias unowned var weak where while willSet`),
  php: C_FAMILY(`abstract and array as break callable case catch class clone const continue declare
    default do echo else elseif empty enddeclare endfor endforeach endif endswitch endwhile enum
    extends final finally fn for foreach function global goto if implements include
    include_once instanceof insteadof interface isset list match namespace new or print private
    protected public readonly require require_once return static switch throw trait try unset use
    var while xor yield true false null int string bool float void mixed never self parent`),
  sh: HASH_FAMILY(`if then else elif fi for while until do done case esac function in select time
    coproc return break continue local export readonly declare typeset unset shift eval exec trap
    exit source alias set`, "true false"),
  bash: HASH_FAMILY(`if then else elif fi for while until do done case esac function in select time
    coproc return break continue local export readonly declare typeset unset shift eval exec trap
    exit source alias set`, "true false"),
  zsh: HASH_FAMILY(`if then else elif fi for while until do done case esac function in select time
    coproc return break continue local export readonly declare typeset unset shift eval exec trap
    exit source alias set`, "true false"),
  yaml: CONFIG_LANG,
  yml: CONFIG_LANG,
  toml: CONFIG_LANG,
  ini: CONFIG_LANG,
  sql: SQL_LANG,
  cmd: CMD_LANG,
  bat: CMD_LANG,
  ps1: PS_LANG,
  psm1: PS_LANG,
  psd1: PS_LANG,
  md: MD_LANG,
  markdown: MD_LANG,
  mdx: MD_LANG,
  mjs: C_FAMILY(JS_WORDS),
  cjs: C_FAMILY(JS_WORDS),
  mts: C_FAMILY(TS_WORDS),
  cts: C_FAMILY(TS_WORDS),
  jsonc: CONFIG_LANG,
  json5: CONFIG_LANG,
  html: MARKUP_LANG,
  htm: MARKUP_LANG,
  xml: MARKUP_LANG,
  svg: MARKUP_LANG,
  vue: MARKUP_LANG,
  css: CSS_LANG,
  scss: CSS_LANG,
  less: CSS_LANG,
  graphql: HASH_FAMILY("query mutation fragment on directive enum input interface scalar schema type implements"),
  gql: HASH_FAMILY("query mutation fragment on directive enum input interface scalar schema type implements"),
  lua: HASH_FAMILY(`and break do else elseif end false for function goto if in local nil not or
    repeat return then true until while`)
};
function langOfPath(path) {
  const base = path.slice(Math.max(path.lastIndexOf("/"), path.lastIndexOf("\\")) + 1);
  const dot = base.lastIndexOf(".");
  if (dot <= 0) return void 0;
  const ext = base.slice(dot + 1).toLowerCase();
  return Object.hasOwn(LANGS, ext) ? ext : void 0;
}
function scanLine(line, lang, inBlock = false) {
  if (line.length === 0) return { tokens: [], inBlock };
  const cfg = lang !== void 0 ? LANGS[lang] : void 0;
  if (cfg === void 0 || cfg.lineComments.length === 0 && cfg.keywords.size === 0) {
    return { tokens: [{ text: line, type: "plain" }], inBlock: false };
  }
  let inComment = inBlock && cfg.blockComment !== void 0;
  const tokens = [];
  const push = (text, type) => {
    if (text.length === 0) return;
    const last = tokens[tokens.length - 1];
    if (last !== void 0 && last.type === type) tokens[tokens.length - 1] = { text: last.text + text, type };
    else tokens.push({ text, type });
  };
  let i = 0;
  const atLineComment = () => {
    for (const lead of cfg.lineComments) {
      if (line.startsWith(lead, i)) return lead;
    }
    return void 0;
  };
  const atBlockOpen = () => cfg.blockComment !== void 0 && line.startsWith(cfg.blockComment[0], i) ? cfg.blockComment[0] : void 0;
  const readString = () => {
    const quote = line[i];
    i += 1;
    while (i < line.length && line[i] !== quote) {
      if (line[i] === "\\") i += 1;
      i += 1;
    }
    i = Math.min(i + 1, line.length);
  };
  while (i < line.length) {
    if (inComment) {
      const closeIdx = cfg.blockComment !== void 0 ? line.indexOf(cfg.blockComment[1], i) : -1;
      if (closeIdx === -1) {
        push(line.slice(i), "comment");
        return { tokens, inBlock: true };
      }
      const end = closeIdx + (cfg.blockComment?.[1].length ?? 0);
      push(line.slice(i, end), "comment");
      i = end;
      inComment = false;
      continue;
    }
    const ch = line[i];
    const wsMatch = /\s/u.exec(line.slice(i));
    if (wsMatch !== null && wsMatch.index === 0) {
      push(ch, "plain");
      i += 1;
      continue;
    }
    const commentLead = atLineComment();
    if (commentLead !== void 0) {
      push(line.slice(i), "comment");
      break;
    }
    const blockOpen = atBlockOpen();
    if (blockOpen !== void 0 && cfg.blockComment !== void 0) {
      const close = line.indexOf(cfg.blockComment[1], i + blockOpen.length);
      const end = close === -1 ? line.length : close + cfg.blockComment[1].length;
      push(line.slice(i, end), "comment");
      i = end;
      inComment = close === -1;
      continue;
    }
    if (cfg.strings !== void 0 && cfg.strings.includes(ch)) {
      const start = i;
      readString();
      push(line.slice(start, i), "string");
      continue;
    }
    if (/[0-9]/u.test(ch)) {
      const m = /^(?:0[xXbo][0-9a-fA-F_]+|[0-9][0-9_]*(?:\.[0-9_]+)?(?:[eE][+-]?[0-9_]+)?)/u.exec(line.slice(i));
      const len = m !== null ? m[0].length : 1;
      push(line.slice(i, i + len), "number");
      i += len;
      continue;
    }
    if (cfg.wordStart.test(ch)) {
      let j = i + 1;
      while (j < line.length && cfg.wordBody.test(line[j])) j += 1;
      const word = line.slice(i, j);
      if ((lang === "cmd" || lang === "bat") && word.toLowerCase() === "rem") {
        push(line.slice(i), "comment");
        break;
      }
      let k = j;
      while (k < line.length && (line[k] === " " || line[k] === "	")) k += 1;
      if (cfg.constants.has(word)) push(word, "keyword");
      else if (cfg.keywords.has(word)) push(word, "keyword");
      else if (line[k] === "(") push(word, "function");
      else if (/^[A-Z]/u.test(word) && word.length > 1) push(word, "type");
      else push(word, "plain");
      i = j;
      continue;
    }
    if (cfg.macro && ch === "#" && (i === 0 || /\s/u.test(line[i - 1]))) {
      let j = i + 1;
      while (j < line.length && cfg.wordBody.test(line[j])) j += 1;
      push(line.slice(i, j), "macro");
      i = j;
      continue;
    }
    push(ch, "plain");
    i += 1;
  }
  return { tokens, inBlock: inComment };
}
function hasBlockComment(lang) {
  return lang !== void 0 && LANGS[lang]?.blockComment !== void 0;
}
function isColored(token) {
  return COLORED.has(token.type);
}

// src/client/diff/DiffRows.tsx
var import_react3 = require("react");
var import_diff = __toESM(require_diff(), 1);
var import_jsx_runtime2 = require("react/jsx-runtime");
var FOLD_THRESHOLD = 120;
var MAX_ROWS = 600;
var TOKEN_CLASS = {
  plain: "",
  comment: import_diff.default.tokComment ?? "",
  string: import_diff.default.tokString ?? "",
  keyword: import_diff.default.tokKeyword ?? "",
  number: import_diff.default.tokNumber ?? "",
  type: import_diff.default.tokType ?? "",
  function: import_diff.default.tokFunction ?? "",
  macro: import_diff.default.tokMacro ?? ""
};
function tokenSpanClass(type, changed) {
  const color = TOKEN_CLASS[type];
  return changed ? `${color} ${import_diff.default.inlineChange}` : color;
}
function tokensToNodes(tokens, changed = false) {
  const nodes = [];
  for (const token of tokens) {
    if (!changed && !isColored(token)) nodes.push(token.text);
    else nodes.push(/* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: tokenSpanClass(token.type, changed), children: token.text }, String(nodes.length)));
  }
  return nodes;
}
function buildInlineMap(segments) {
  const map = /* @__PURE__ */ new Map();
  for (const segment of segments) {
    if (segment.kind !== "hunk") continue;
    const rows = segment.rows;
    let i = 0;
    while (i < rows.length) {
      if (rows[i].kind !== "mod") {
        i += 1;
        continue;
      }
      let j = i;
      while (j < rows.length && rows[j].kind === "mod") j += 1;
      const block = rows.slice(i, j);
      const half = Math.floor(block.length / 2);
      for (let p = 0; p < half; p += 1) {
        const delRow = block[p];
        const addRow = block[p + half];
        const inline = diffInline(delRow.text, addRow.text);
        map.set(delRow, inline);
        map.set(addRow, inline);
      }
      i = j;
    }
  }
  return map;
}
function diffBlockEntries(segments, lang) {
  const entries = /* @__PURE__ */ new Map();
  if (!hasBlockComment(lang)) return entries;
  let oldIn = false;
  let newIn = false;
  for (const segment of segments) {
    if (segment.kind !== "hunk") continue;
    for (const row of segment.rows) {
      const isOld = row.oldLine !== void 0;
      const isNew = row.newLine !== void 0;
      entries.set(row, isOld ? oldIn : newIn);
      if (isOld) oldIn = scanLine(row.text, lang, oldIn).inBlock;
      if (isNew) newIn = scanLine(row.text, lang, newIn).inBlock;
    }
  }
  return entries;
}
function DiffRows({ segments, lang, resolveFold }) {
  const [expandedLines, setExpandedLines] = (0, import_react3.useState)(/* @__PURE__ */ new Set());
  const [expandedFolds, setExpandedFolds] = (0, import_react3.useState)(/* @__PURE__ */ new Set());
  const [expandedAll, setExpandedAll] = (0, import_react3.useState)(false);
  const [foldData, setFoldData] = (0, import_react3.useState)(/* @__PURE__ */ new Map());
  const [foldLoading, setFoldLoading] = (0, import_react3.useState)(/* @__PURE__ */ new Set());
  const [foldFailed, setFoldFailed] = (0, import_react3.useState)(/* @__PURE__ */ new Set());
  const foldEpoch = (0, import_react3.useRef)(0);
  (0, import_react3.useEffect)(() => {
    setExpandedLines(/* @__PURE__ */ new Set());
    setExpandedFolds(/* @__PURE__ */ new Set());
    setExpandedAll(false);
    setFoldData(/* @__PURE__ */ new Map());
    setFoldLoading(/* @__PURE__ */ new Set());
    setFoldFailed(/* @__PURE__ */ new Set());
    foldEpoch.current += 1;
  }, [segments]);
  const inlineMap = (0, import_react3.useMemo)(() => buildInlineMap(segments), [segments]);
  const blockEntries = (0, import_react3.useMemo)(() => diffBlockEntries(segments, lang), [segments, lang]);
  const renderDiffRow = (row, rowKey) => {
    if (row.kind === "meta") {
      return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: import_diff.default.row, "data-kind": "meta", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: import_diff.default.metaText, children: row.text }) }, rowKey);
    }
    const isLong = row.text.length > FOLD_THRESHOLD;
    const isFolded = isLong && !expandedLines.has(rowKey);
    const blockEntry = blockEntries.get(row) ?? false;
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
      "div",
      {
        className: import_diff.default.row,
        "data-kind": row.kind,
        "data-folded": isFolded ? "true" : void 0,
        onClick: isLong ? () => {
          setExpandedLines((prev) => {
            const next = new Set(prev);
            if (next.has(rowKey)) next.delete(rowKey);
            else next.add(rowKey);
            return next;
          });
        } : void 0,
        title: isFolded ? row.text : void 0,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: import_diff.default.lineNo, children: row.oldLine !== void 0 ? String(row.oldLine) : "" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: import_diff.default.lineNo, children: row.newLine !== void 0 ? String(row.newLine) : "" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: import_diff.default.sign, children: row.kind === "del" ? "-" : row.kind === "add" ? "+" : row.kind === "mod" ? "~" : " " }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { className: import_diff.default.text, "data-folded": isFolded ? "true" : void 0, children: [
            row.kind === "mod" && (() => {
              const inline = inlineMap.get(row);
              if (inline === void 0) return tokensToNodes(scanLine(row.text, lang, blockEntry).tokens);
              const side = coalesceInline(row.oldLine !== void 0 ? inline.old : inline.next);
              const nodes = [];
              let state = blockEntry;
              for (const seg of side) {
                const scan = scanLine(seg.text, lang, state);
                state = scan.inBlock;
                nodes.push(...tokensToNodes(scan.tokens, seg.changed));
              }
              return nodes;
            })(),
            row.kind !== "mod" && tokensToNodes(scanLine(row.text, lang, blockEntry).tokens)
          ] })
        ]
      },
      rowKey
    );
  };
  let renderedRows = 0;
  const renderSegment = (segment, segIndex) => {
    if (segment.kind === "hunk") {
      const capped = !expandedAll && renderedRows + segment.rows.length > MAX_ROWS;
      const rows = capped ? segment.rows.slice(0, Math.max(MAX_ROWS - renderedRows, 0)) : segment.rows;
      renderedRows += rows.length;
      return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { children: rows.map((row, index) => renderDiffRow(row, `${segIndex}-${String(index)}`)) }, `hunk-${String(segIndex)}`);
    }
    if (foldFailed.has(segIndex)) {
      return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: import_diff.default.foldRow, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: import_diff.default.foldMarker, title: t("changesContext"), children: t("changesFoldUnavailable") }) }, `fold-${String(segIndex)}`);
    }
    const resolvedRows = foldData.get(segIndex);
    const expandable2 = (segment.rows !== void 0 || resolvedRows !== void 0 || resolveFold !== void 0) && segment.count >= MIN_FOLD;
    if (!expandable2) {
      return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: import_diff.default.foldRow, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: import_diff.default.foldMarker, title: t("changesContext"), children: t("changesFold", { count: segment.count }) }) }, `fold-${String(segIndex)}`);
    }
    const loading = foldLoading.has(segIndex);
    const isExpanded = expandedFolds.has(segIndex);
    const revealed = segment.rows ?? resolvedRows;
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
      "div",
      {
        className: import_diff.default.foldRow,
        "data-expandable": loading ? void 0 : "true",
        "data-expanded": isExpanded ? "true" : void 0,
        onClick: loading ? void 0 : () => {
          if (revealed !== void 0) {
            setExpandedFolds((prev) => {
              const next = new Set(prev);
              if (next.has(segIndex)) next.delete(segIndex);
              else next.add(segIndex);
              return next;
            });
            return;
          }
          if (resolveFold === void 0) return;
          const epoch = foldEpoch.current;
          setFoldLoading((prev) => new Set(prev).add(segIndex));
          resolveFold(segment).then(
            (rows) => {
              if (foldEpoch.current !== epoch) return;
              setFoldData((prev) => new Map(prev).set(segIndex, rows));
              setFoldLoading((prev) => {
                const next = new Set(prev);
                next.delete(segIndex);
                return next;
              });
              setExpandedFolds((prev) => new Set(prev).add(segIndex));
            },
            () => {
              if (foldEpoch.current !== epoch) return;
              setFoldLoading((prev) => {
                const next = new Set(prev);
                next.delete(segIndex);
                return next;
              });
              setFoldFailed((prev) => new Set(prev).add(segIndex));
            }
          );
        },
        children: isExpanded && revealed !== void 0 ? revealed.map((row, index) => renderDiffRow(row, `${segIndex}-${String(index)}`)) : /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: import_diff.default.foldMarker, title: t("changesContext"), children: loading ? t("changesFoldLoading") : t("changesFold", { count: segment.count }) })
      },
      `fold-${String(segIndex)}`
    );
  };
  const parts = segments.map(renderSegment);
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: import_diff.default.rows, children: [
    parts,
    renderedRows >= MAX_ROWS && !expandedAll && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { type: "button", className: import_diff.default.expand, onClick: () => {
      setExpandedAll(true);
    }, children: t("diffExpand", { count: segments.reduce((sum, s) => sum + (s.kind === "hunk" ? s.rows.length : 0), 0) - renderedRows }) })
  ] });
}

// src/client/diff/DiffFiles.tsx
var import_diff2 = __toESM(require_diff(), 1);
var import_jsx_runtime3 = require("react/jsx-runtime");
function expandable(file) {
  return !file.binary && file.hunks.length > 0;
}
function defaultExpandedFiles(files, startFolded) {
  if (startFolded) return /* @__PURE__ */ new Set();
  const only = files.length === 1 ? files[0] : void 0;
  return only !== void 0 && expandable(only) ? /* @__PURE__ */ new Set([0]) : /* @__PURE__ */ new Set();
}
function fileTag(file) {
  if (file.binary) return t("diffBinary");
  if (file.oldPath === "/dev/null") return t("diffAdded");
  if (file.newPath === "/dev/null") return t("diffDeleted");
  const oldPath = displayPath(file.oldPath);
  const newPath = displayPath(file.newPath);
  if (oldPath !== newPath) return t("diffRenamed");
  return null;
}
function DiffFiles({ diff, untrackedPath, untrackedContent, startFolded = false, parsedFiles, resolveFold }) {
  const parsed = (0, import_react4.useMemo)(() => {
    if (parsedFiles !== void 0) return { files: [...parsedFiles] };
    if (untrackedPath !== void 0) {
      return { files: [untrackedFile(untrackedPath, untrackedContent ?? "")] };
    }
    return parseUnifiedDiff(diff);
  }, [parsedFiles, diff, untrackedPath, untrackedContent]);
  const [expandedFiles, setExpandedFiles] = (0, import_react4.useState)(() => defaultExpandedFiles(parsed.files, startFolded));
  (0, import_react4.useEffect)(() => {
    setExpandedFiles(defaultExpandedFiles(parsed.files, startFolded));
  }, [parsed, startFolded]);
  const foldCache = (0, import_react4.useRef)(/* @__PURE__ */ new Map());
  (0, import_react4.useEffect)(() => {
    foldCache.current = /* @__PURE__ */ new Map();
  }, [parsed]);
  const loadFold = (file, segment) => {
    if (resolveFold === void 0) return Promise.resolve([]);
    const path = displayPath(file.newPath === "/dev/null" ? file.oldPath : file.newPath);
    const key = `${path}|${String(segment.oldStart)}|${String(segment.newStart)}`;
    let promise = foldCache.current.get(key);
    if (promise === void 0) {
      promise = resolveFold(file, segment);
      foldCache.current.set(key, promise);
      promise.catch(() => {
        foldCache.current.delete(key);
      });
    }
    return promise;
  };
  const files = (0, import_react4.useMemo)(
    () => parsed.files.map((file) => {
      const segments = unifiedSegments(file);
      return { file, segments, stats: diffStats(segments) };
    }),
    [parsed]
  );
  const renderFile = (entry, fileIndex) => {
    const { file, segments, stats } = entry;
    const tag = fileTag(file);
    const from = displayPath(file.oldPath);
    const to = displayPath(file.newPath);
    const canExpand = expandable(file);
    const fileExpanded = expandedFiles.has(fileIndex);
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: import_diff2.default.fileBlock, children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
        "button",
        {
          type: "button",
          className: import_diff2.default.file,
          disabled: !canExpand,
          "aria-expanded": canExpand ? fileExpanded : void 0,
          onClick: () => {
            setExpandedFiles((current) => {
              const next = new Set(current);
              if (next.has(fileIndex)) next.delete(fileIndex);
              else next.add(fileIndex);
              return next;
            });
          },
          children: [
            canExpand && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { "aria-hidden": "true", className: clsx_default(import_diff2.default.fileChevron, fileExpanded && import_diff2.default.fileChevronExpanded), children: "\u203A" }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: import_diff2.default.filePath, children: to }),
            from !== to && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: import_diff2.default.fileOld, children: [
              "\u2190 ",
              from
            ] }),
            tag !== null && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: import_diff2.default.fileTag, children: tag }),
            canExpand && (stats.added > 0 || stats.deleted > 0) && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: import_diff2.default.fileStats, children: [
              stats.added > 0 && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: import_diff2.default.statAdd, children: [
                "+",
                String(stats.added)
              ] }),
              stats.deleted > 0 && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: import_diff2.default.statDel, children: [
                "\u2212",
                String(stats.deleted)
              ] })
            ] })
          ]
        }
      ),
      canExpand && fileExpanded && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(DiffRows, { segments, lang: langOfPath(to), resolveFold: resolveFold !== void 0 ? (segment) => loadFold(file, segment) : void 0 })
    ] }, `file-${String(fileIndex)}`);
  };
  if (parsed.files.length === 0) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: import_diff2.default.files, children: files.map(renderFile) });
}

// src/client/frame-batcher.ts
function createFrameBatcher() {
  let frame = null;
  let task = null;
  const run = () => {
    frame = null;
    const current = task;
    task = null;
    current?.();
  };
  return {
    schedule(next) {
      task = next;
      if (frame === null) frame = requestAnimationFrame(run);
    },
    flushNow() {
      if (frame !== null) {
        cancelAnimationFrame(frame);
        frame = null;
      }
      run();
    },
    dispose() {
      if (frame !== null) {
        cancelAnimationFrame(frame);
        frame = null;
      }
      task = null;
    }
  };
}

// src/client/GitDiffPane.tsx
var import_changes2 = __toESM(require_changes(), 1);
var import_diff3 = __toESM(require_diff(), 1);
var import_jsx_runtime4 = require("react/jsx-runtime");
var HEIGHT_MIN = 140;
var HEIGHT_STEP = 24;
function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return "?";
  if (bytes < 1024) return `${String(bytes)} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KiB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MiB`;
}
function GitDiffPane({ target, scope, height, onHeightCommit, onClose }) {
  const [tick, setTick] = (0, import_react5.useState)(0);
  const [loading, setLoading] = (0, import_react5.useState)(true);
  const [error, setError] = (0, import_react5.useState)(null);
  const [diffText, setDiffText] = (0, import_react5.useState)(null);
  const [untracked, setUntracked] = (0, import_react5.useState)(void 0);
  const [effectiveStaged, setEffectiveStaged] = (0, import_react5.useState)(null);
  const [notice, setNotice] = (0, import_react5.useState)(null);
  const gitRef = target.ref;
  const gitScope = (0, import_react5.useMemo)(() => ({
    sessionId: scope.sessionId,
    cwd: scope.cwd,
    ...gitRef?.repoRoot !== void 0 ? { repoRoot: gitRef.repoRoot } : {}
  }), [scope.sessionId, scope.cwd, gitRef?.repoRoot]);
  (0, import_react5.useEffect)(() => {
    if (gitRef === null) return;
    let cancelled = false;
    const paneScope = {
      sessionId: scope.sessionId,
      cwd: scope.cwd,
      ...gitRef.repoRoot !== void 0 ? { repoRoot: gitRef.repoRoot } : {}
    };
    setLoading(true);
    setError(null);
    setDiffText(null);
    setUntracked(void 0);
    setEffectiveStaged(null);
    setNotice(null);
    const load = async () => {
      try {
        if (gitRef.kind === "commit") {
          const result2 = await api.gitCommitDiff(paneScope, gitRef.hashFull, gitRef.worktree);
          if (!cancelled) setDiffText(result2.diff);
          return;
        }
        if (gitRef.untracked === true && !gitRef.staged) {
          const text = await api.fsRead(paneScope, resolveSidebarPath(gitRef.repoRoot ?? gitRef.worktree ?? scope.cwd, gitRef.path));
          if (!cancelled) {
            setDiffText("");
            if (text.kind === "text") {
              setUntracked(text.content);
              if (text.truncated) setNotice(t("diffTruncated", { size: formatBytes(text.size) }));
            } else {
              setNotice(t("diffBinaryNotice", { size: formatBytes(text.size) }));
            }
          }
          return;
        }
        let result = await api.gitDiff(paneScope, gitRef.path, gitRef.staged, gitRef.worktree);
        let staged = null;
        if (result.diff === "") {
          const other = await api.gitDiff(paneScope, gitRef.path, !gitRef.staged, gitRef.worktree);
          if (other.diff !== "") {
            result = other;
            staged = !gitRef.staged;
          }
        }
        if (!cancelled) {
          setDiffText(result.diff);
          setEffectiveStaged(staged);
        }
      } catch (reason) {
        if (!cancelled) setError(reason instanceof Error ? reason.message : String(reason));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [gitRef, scope.sessionId, scope.cwd, tick]);
  const foldContents = (0, import_react5.useRef)(/* @__PURE__ */ new Map());
  (0, import_react5.useEffect)(() => {
    foldContents.current = /* @__PURE__ */ new Map();
  }, [gitRef, tick]);
  const foldLoader = (0, import_react5.useMemo)(() => {
    if (gitRef === null) return void 0;
    const sidesOf = (file) => {
      const ofSides = (oldContent, newContent) => {
        if ((oldContent ?? "") === "" && (newContent ?? "") === "") throw new Error("no content on either side");
        return { old: oldContent ?? "", new: newContent ?? "" };
      };
      const fetchSides = async () => {
        if (gitRef.kind === "commit") {
          const [oldSide2, newSide] = await Promise.all([
            file.oldPath === "/dev/null" ? Promise.resolve({ content: null }) : api.gitShow(gitScope, `${gitRef.hashFull}^`, displayPath(file.oldPath), gitRef.worktree),
            file.newPath === "/dev/null" ? Promise.resolve({ content: null }) : api.gitShow(gitScope, gitRef.hashFull, displayPath(file.newPath), gitRef.worktree)
          ]);
          return ofSides(oldSide2.content, newSide.content);
        }
        const staged = effectiveStaged ?? gitRef.staged;
        if (staged) {
          const [oldSide2, newSide] = await Promise.all([
            file.oldPath === "/dev/null" ? Promise.resolve({ content: null }) : api.gitShow(gitScope, "HEAD", displayPath(file.oldPath), gitRef.worktree),
            file.newPath === "/dev/null" ? Promise.resolve({ content: null }) : api.gitShow(gitScope, ":0", displayPath(file.newPath), gitRef.worktree)
          ]);
          return ofSides(oldSide2.content, newSide.content);
        }
        const [oldSide, worktree] = await Promise.all([
          file.oldPath === "/dev/null" ? Promise.resolve({ content: null }) : api.gitShow(gitScope, ":0", displayPath(file.oldPath), gitRef.worktree),
          api.fsRead(gitScope, resolveSidebarPath(gitRef.repoRoot ?? gitRef.worktree ?? scope.cwd, displayPath(file.newPath))).catch(() => null)
        ]);
        return ofSides(oldSide.content, worktree !== null && worktree.kind === "text" ? worktree.content : null);
      };
      const path = displayPath(file.newPath === "/dev/null" ? file.oldPath : file.newPath);
      let promise = foldContents.current.get(path);
      if (promise === void 0) {
        promise = fetchSides();
        foldContents.current.set(path, promise);
      }
      return promise;
    };
    return (file, segment) => sidesOf(file).then((sides) => foldRowsFromContents(segment, sides.old, sides.new));
  }, [gitRef, gitScope, effectiveStaged, scope]);
  const parsedPatch = (0, import_react5.useMemo)(
    () => diffText === null || diffText === "" ? null : parseUnifiedDiff(diffText),
    [diffText]
  );
  const gitStats = (0, import_react5.useMemo)(() => {
    if (parsedPatch === null) return null;
    let added = 0;
    let deleted = 0;
    for (const file of parsedPatch.files) {
      const stats2 = diffStats(unifiedSegments(file));
      added += stats2.added;
      deleted += stats2.deleted;
    }
    return { added, deleted };
  }, [parsedPatch]);
  const paneRef = (0, import_react5.useRef)(null);
  const [dragHeight, setDragHeight] = (0, import_react5.useState)(null);
  const paneHeight = dragHeight ?? height;
  const renderedHeight = () => paneRef.current?.offsetHeight ?? HEIGHT_MIN;
  const clamp = (value) => Math.min(Math.max(value, HEIGHT_MIN), Math.round(window.innerHeight * 0.7));
  const dragOrigin = (0, import_react5.useRef)(null);
  const dragBatcher = (0, import_react5.useRef)(createFrameBatcher()).current;
  (0, import_react5.useEffect)(() => () => dragBatcher.dispose(), [dragBatcher]);
  const onHandleDown = (event) => {
    event.preventDefault();
    dragOrigin.current = { y: event.clientY, h: renderedHeight() };
    const onMove = (ev) => {
      if (dragOrigin.current === null) return;
      const next = clamp(dragOrigin.current.h + (dragOrigin.current.y - ev.clientY));
      dragBatcher.schedule(() => {
        setDragHeight(next);
      });
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      dragOrigin.current = null;
      dragBatcher.flushNow();
      setDragHeight((current) => {
        if (current !== null) onHeightCommit(current);
        return null;
      });
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };
  const title = gitRef.kind === "worktree" ? gitRef.path : `${gitRef.hash} ${gitRef.subject}`;
  const stats = gitStats;
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { ref: paneRef, className: import_changes2.default.diffPane, style: { height: paneHeight ?? "50%" }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
      "div",
      {
        className: import_changes2.default.dragHandle,
        role: "separator",
        "aria-orientation": "horizontal",
        "aria-label": t("changesResizePreview"),
        tabIndex: 0,
        onPointerDown: onHandleDown,
        onKeyDown: (event) => {
          if (event.key === "ArrowUp") {
            event.preventDefault();
            onHeightCommit(clamp(renderedHeight() + HEIGHT_STEP));
          }
          if (event.key === "ArrowDown") {
            event.preventDefault();
            onHeightCommit(clamp(renderedHeight() - HEIGHT_STEP));
          }
        }
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: import_changes2.default.diffHead, children: [
      gitRef.kind === "worktree" && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: import_changes2.default.diffKind, "data-kind": "git", children: gitRef.staged ? t("staged") : t("unstaged") }),
      gitRef.kind === "commit" && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: import_changes2.default.diffKind, "data-kind": "git", children: gitRef.hash }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: import_changes2.default.diffPath, title, children: title }),
      stats !== null && (stats.added > 0 || stats.deleted > 0) && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { className: import_changes2.default.diffStats, children: [
        stats.added > 0 && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { className: import_diff3.default.statAdd, children: [
          "+",
          String(stats.added)
        ] }),
        stats.deleted > 0 && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { className: import_diff3.default.statDel, children: [
          "\u2212",
          String(stats.deleted)
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        "button",
        {
          type: "button",
          className: import_changes2.default.iconButton,
          "aria-label": t("refresh"),
          title: t("refresh"),
          disabled: loading,
          onClick: () => {
            setTick((value) => value + 1);
          },
          children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_dsh_client_ui_primitives2.IconRefreshOutline16, { size: 14 })
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        "button",
        {
          type: "button",
          className: import_changes2.default.iconButton,
          "aria-label": t("changesClosePreview"),
          title: t("changesClosePreview"),
          onClick: onClose,
          children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_dsh_client_ui_primitives2.IconCloseOutline16, { size: 14 })
        }
      )
    ] }),
    loading ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: import_changes2.default.paneBody, children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: import_changes2.default.gitPlaceholder, children: t("loading") }) }) : error !== null ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: import_changes2.default.paneBody, children: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: import_changes2.default.gitError, children: [
      t("diffLoadError"),
      ": ",
      error
    ] }) }) : /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: import_changes2.default.paneBody, children: [
      notice !== null && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: import_changes2.default.paneNotice, children: notice }),
      (diffText !== null && diffText !== "" || untracked !== void 0) && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        DiffFiles,
        {
          diff: diffText ?? "",
          resolveFold: foldLoader,
          startFolded: gitRef.kind === "commit",
          parsedFiles: parsedPatch === null ? void 0 : parsedPatch.files,
          untrackedPath: untracked !== void 0 && gitRef.kind === "worktree" ? gitRef.path : void 0,
          untrackedContent: untracked
        }
      ),
      diffText === "" && untracked === void 0 && notice === null && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: import_changes2.default.gitEmpty, children: t("diffEmpty") })
    ] })
  ] });
}

// src/client/store.ts
var import_dsh_client_store = require("@deepseek-ai/dsh-client-store");
function initialView() {
  return {
    status: null,
    worktrees: [],
    selectedWorktree: void 0,
    repoRoot: void 0,
    branchNames: [],
    logEntries: [],
    logEnded: false,
    error: null
  };
}
function createGitStore() {
  const define = import_dsh_client_store.defineStore;
  return define({
    init: () => ({
      view: initialView(),
      commitMsg: "",
      preview: null,
      paneHeight: null,
      scopeKey: ""
    }),
    actions: {
      publish: (draft, patch) => {
        Object.assign(draft.view, patch);
      },
      setCommitMsg: (draft, text) => {
        draft.commitMsg = text;
      },
      setPreview: (draft, ref) => {
        draft.preview = ref;
      },
      setPaneHeight: (draft, height) => {
        draft.paneHeight = height;
      },
      resetScope: (draft, scopeKey) => {
        draft.scopeKey = scopeKey;
        draft.view.selectedWorktree = void 0;
      }
    }
  });
}

// src/client/index.tsx
var import_jsx_runtime5 = require("react/jsx-runtime");
var TAB_ID = "dsh-sidebar-git:git";
var inject = ["slots", "locale", "sessions", "sidebarRightTabs"];
var clientCtx;
function useSessionCwd(sessionId) {
  const list = clientCtx?.sessions?.list;
  return (0, import_react6.useSyncExternalStore)(
    (0, import_react6.useMemo)(() => (listener) => list?.subscribe(listener) ?? (() => {
    }), [list]),
    () => list?.getSnapshot().byId[sessionId]?.cwd
  );
}
function GitGlyph(props) {
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_dsh_client_ui_primitives3.IconBranchOutline16, { size: props?.size ?? 16 });
}
function GitTabTitle() {
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("span", { style: { display: "inline-flex", alignItems: "center", gap: 4 }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_dsh_client_ui_primitives3.IconBranchOutline16, { size: 14 }),
    t("git")
  ] });
}
function GitTabBody(props) {
  const { sessionId, useTabInfo, useStore, actions } = props;
  const info = useTabInfo();
  const visible = info.tab.visible;
  const cwd = useSessionCwd(sessionId);
  const scope = (0, import_react6.useMemo)(() => ({ sessionId, cwd }), [sessionId, cwd]);
  const preview = useStore((state) => state.preview);
  const paneHeight = useStore((state) => state.paneHeight);
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { style: { display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
      GitPanel,
      {
        scope,
        visible,
        onPreview: (ref) => {
          actions.setPreview(ref);
        },
        selectedRef: preview,
        useStore,
        actions
      }
    ),
    preview !== null && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
      GitDiffPane,
      {
        target: { kind: "git", ref: preview },
        scope,
        height: paneHeight,
        onHeightCommit: (height) => {
          actions.setPaneHeight(height);
        },
        onClose: () => {
          actions.setPreview(null);
        }
      }
    )
  ] });
}
function gitDefinition() {
  return {
    id: TAB_ID,
    kind: "git",
    // An implementation from outside the product outranks the shipped ones.
    priority: "extension",
    title: () => t("git"),
    // The guide orders its capsules by this number alone; a tie falls back to
    // registration order, which varies between page loads. 15 sits between the
    // workspace-files capsule (10) and the new-terminal one (20) — the value
    // this used to share with the terminal, which is why the Git capsule
    // drifted between the second and third row.
    guide: [{
      order: 15,
      title: () => t("git"),
      description: () => t("guideDescGit"),
      icon: GitGlyph
    }]
  };
}
function apply(ctx) {
  clientCtx = ctx;
  try {
    attachLocale(ctx.locale);
  } catch (error) {
    console.error("[dsh-sidebar-git] locale attach failed:", error);
  }
  try {
    const tabs = ctx.sidebarRightTabs;
    if (tabs === void 0) {
      console.error("[dsh-sidebar-git] sidebarRightTabs service is unavailable");
      return;
    }
    ctx.effect(() => tabs.register(gitDefinition()), "dsh-sidebar-git: git tab type");
    const store = createGitStore();
    ctx.effect(() => ctx.slots.inject("sidebar.right.pane.tab", () => ctx.slots.register({
      name: "sidebar.right.pane.tab",
      key: TAB_ID,
      store
    }, GitTabBody)), "dsh-sidebar-git: git tab body");
    ctx.effect(() => ctx.slots.inject("sidebar.right.pane.tab.title", () => ctx.slots.register({
      name: "sidebar.right.pane.tab.title",
      key: TAB_ID
    }, GitTabTitle)), "dsh-sidebar-git: git tab title");
  } catch (error) {
    console.error("[dsh-sidebar-git] registration failed:", error);
  }
}
		return module.exports;
	}
});
