<?php

// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Displays the TinyMCE popup window to insert an equation
 * The original plugin developed by The Open University was later modified
 * for TeX-only use with MathJaX rendering by Mikael Kurula/Abo Akademi University.
 * (The OU version of the plugin has additional dependencies to allow it to process
 * MathML code as well.)
 *
 * @package tinymce_tinytex
 * @copyright 2013 The Open University
 * @license http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

define('NO_UPGRADE_CHECK', true); // Ignore upgrade check.

require_once(dirname(dirname(dirname(dirname(dirname(dirname(__FILE__)))))) . '/config.php');

$PAGE->set_context(get_system_context());

$editor = get_texteditor('tinymce');
$plugin = $editor->get_plugin('tinytex');

define('TINYMCE_tinytex_TAB_PREF', 'tinymce_tinytex_tab');

$lang = required_param('lang', PARAM_ALPHA);
$tab = optional_param('tab', '', PARAM_ALPHA);
$eq = optional_param('eq', '', PARAM_RAW);
$inline = optional_param('inline', 0, PARAM_INT);
$preftab = get_user_preferences(TINYMCE_tinytex_TAB_PREF, 'tex');

header('Content-Type: text/html; charset=UTF-8');

if ($tab) {
    if (!in_array($tab, array('tex', 'mathml'))) {
        print_error('invalidaction');
    }
    if ($tab !== $preftab) {
        set_user_preference(TINYMCE_tinytex_TAB_PREF, $tab);
    }
} else {
    $tab = $preftab;
}

// Build help link if we should be displaying it.
$helplink = '';
if (!empty($CFG->docroot)) {
    $url = get_docs_url('tinymce/tinytex/' . $tab);
    $iconurl = $plugin->get_tinymce_file_url('img/newwindow.png');
    $helplink = <<<EOF
        <span class="helplink">
            <a href="$url" target="_blank"><span>{#tinytex.helplink}</span>
            <img src="$iconurl" alt="{#tinytex.newwindow}"/></a>
        </span>
EOF;
}

?>
<!doctype html>
<html>
<head>
    <title><?php print_string('tinytex:desc', 'tinymce_tinytex'); ?></title>
    <script type="text/javascript" src="<?php echo $editor->get_tinymce_base_url(); ?>tiny_mce_popup.js"></script>
    <script type="text/javascript" src="<?php echo $plugin->get_tinymce_file_url('js/dialog.js'); ?>"></script>
    <link rel="stylesheet" href="<?php echo $plugin->get_tinymce_file_url('css/style.css'); ?>" />
</head>
<body>

<?php
    // Tabs. Note this page is local to TinyMCE and doesn't have Moodle themes,
    // so we can't use Moodle tab output.
?>
            <div class="code">
                <label style="display:none" for="code">{#tinytex.codelabel}</label>
                <textarea id="code"><?php echo s($eq); ?></textarea>
<?php
if ($tab === 'tex') { ?>
                <div>
                    <input type="checkbox" name="inline" id="inline"
    <?php
    if ($inline) {
        echo 'checked="checked"';
    } ?>/>
                    <label for="inline">{#tinytex.inline}</label>
                </div>
    <?php
} ?>
                </div>

            <fieldset>
                <legend>{#media_dlg.preview}</legend>
                <form id="invisibleform" target="iframe" action="preview.php" method="post">
                    <div>
                        <input type="hidden" name="type" value="<?php echo $tab; ?>"/>
                        <input type="hidden" name="eq"/>
                        <input type="hidden" name="rand"/>
                        <input type="hidden" name="inline"/>
                    </div>
                </form>
                <div class="preview">
                    <iframe src="about:blank" width="100" height="50" id="iframe" name="iframe">
                    </iframe>
                </div>
            </fieldset>
        </div>
    </div>

    <div class="mceActionPanel" id="buttons">
        <div style="float: right">
            <?php if ($eq) { ?>
            <input type="button" id="insert" name="insert" value="{#update}"
                    disabled="disabled" onclick="tinytex_dialog.insert(true);" />
            <?php } else { ?>
            <input type="button" id="insert" name="insert" value="{#insert}"
                    disabled="disabled" onclick="tinytex_dialog.insert(false);" />
            <?php } ?>
            <input type="button" id="cancel" name="cancel" value="{#cancel}" onclick="tinyMCEPopup.close();" />
        </div>
        <div style="clear:both"></div>
    </div>

</body>
</html>
