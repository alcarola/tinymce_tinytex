# tinyTeX editor for TinyMCE in Moodle

This is a plugin that makes entering TeX code into Moodle easier by providing a human-friendly formula preview for TinyMCE, the editor most people use e.g. for editing forum posts. After installation of the plugin, you will get an icon in your TinyMCE editor with square root symbol with an x under it. Click it and you will be able to type in TeX code and have your code rendered automatically whenever its syntax is correct. You can later click inside formulas in the TinyMCE editor and edit them again by clicking the tinyTeX icon.

The code is a trivial edit of the oumaths TinyMCE plugin by The Open University. The original oumaths plugin depends on external software to handle MathML code, but here these capabilities and dependencies have been dropped. This plugin also uses MathJax for formula rendering, unlike oumaths. "tiny" stands both for "TinyMCE plugin" and the rather tiny amount of code in the plugin. Please let me know (and share) if you develop the code further!


## Installation

1. You need a Moodle installation. The plugin should work at least with Moodle 2.5 and newer. Reports regarding compatibility with Moodle 2.4 and older are most welcome.

2. The plugin assumes that you have MathJax set up in your Moodle, e.g., according to [these instructions](https://github.com/maths/moodle-qtype_stack/blob/master/doc/en/Developer/Mathjax.md).

3. The next step is to either [download the zip file](https://github.com/alcarola/tinymce_tinytex/zipball/master), unzip it, and place it in the directory `moodle\lib\editor\tinymce\plugins`. (You will need to rename the directory `alcarola-tinymce_tinytex-number -> tinytex`.) 

Alternatively, get the code using git by running the following command in the top level folder of your Moodle install: `git clone git://github.com/alcarola/tinymce_tinytex.git lib/editor/tinymce/plugins/tinytex`.

4. Now go to the page Site administration -> Notifications in your Moodle install, as Administrator or similar. You should get a message that the plugin is being installed or updated. That is all.


## Known issues

The plugin is roughly of Beta-level maturity. Fixes are invited for in particular the following issues:

1. Sometimes text is typed with a formula at the end of the line, using the plugin, initially all seems fine. But then if the formula at the end of the line is edited, again using the plugin, changing it from inline to displayed or vice versa, the insert button needs to be clicked twice for the formula editor window to close. When the window is finally closed, the formula gets placed at the wrong place, namely at the beginning of the line, pushing the text part (which used to be to the left of the formula) down one line.


## License

tinyTeX builds on the oumaths plugin, both of which are Licensed under the [GNU General Public, License Version 3](https://github.com/alcarola/tinymce_tinytex/blob/master/COPYING.txt) or later.

