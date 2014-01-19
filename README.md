# tinyTeX editor for TinyMCE in Moodle

This is a trivial edit of the oumaths TinyMCE (Moodle) plugin by The Open University. The original oumaths plugin depends on external software to handle MathML code, but here these capabilities and dependencies have been dropped. This plugin also uses MathJax for formula rendering, unlike oumaths. "tiny" stands both for "TinyMCE plugin" and the rather tiny amount of code in the plugin.


## Installation

The plugin assumes that you have MathJax set up, e.g., according to [these instructions](https://github.com/maths/moodle-qtype_stack/blob/master/doc/en/Developer/Mathjax.md).

The next step is to either [download the zip file](https://github.com/alcarola/tinymce-tinytex/zipball/master), unzip it, and place it in the directory `moodle\lib\editor\tinymce\plugin`. (You will need to rename the directory `tinymce-tinytex -> tinytex`.) Alternatively, get the code using git by running the following command in the top level folder of your Moodle install: `git clone git://github.com/alcarola/tinymce-tinytex.git lib/editor/tinymce/plugins`.

Now go to the page Site administration -> Notifications in your Moodle install, as Administrator or similar. That should be it.


## Known issues

The plugin is roughly of Beta-level maturity. Fixes are invited for the following two issues:

1. Sometimes text is typed with a formula at the end of the line, using the plugin, initially all seems fine. But then if the formula at the end of the line is edited, again using the plugin, changing it from inline to displayed or vice versa, the insert button needs to be clicked twice for the formula editor window to close. When the window is finally closed, the formula gets placed at the wrong place, namely at the beginning of the line, pushing the text part (which used to be to the left of the formula) down one line.


## License

Stack is Licensed under the [GNU General Public, License Version 3](https://github.com/alcarola/tinymce-tinytex/blob/master/COPYING.txt) or later.

