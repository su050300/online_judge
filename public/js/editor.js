//using ace smart ide and setting important parameters

var editor = ace.edit("editor");
editor.setTheme("ace/theme/monokai");
editor.session.setMode("ace/mode/python");
editor.resize();
editor.setOptions({
  autoScrollEditorIntoView: true,
  minLines: 4
});
