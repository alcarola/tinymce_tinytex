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
 * Previews equations in TeX format.
 * The original plugin developed by The Open University was later modified
 * for TeX-only use with MathJaX rendering by Mikael Kurula/Abo Akademi University.
 * (The OU version of the plugin has additional dependencies to allow it to process
 * MathML code as well.) *
 * @package tinymce_tinytex
 * @copyright 2013 The Open University
 * @license http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require_once(dirname(__FILE__) . '/../../../../../config.php');

$PAGE->set_context(get_system_context());
$PAGE->set_url(new moodle_url('/lib/editor/tinymce/plugins/tinytex/preview.php'));
$PAGE->set_pagelayout('popup');
$PAGE->add_body_class('nominwidth');

$eq = required_param('eq', PARAM_RAW);
$type = required_param('type', PARAM_ALPHA);
$rand = required_param('rand', PARAM_ALPHANUMEXT);
$inline = optional_param('inline', 0, PARAM_INT);

// Print header without any skip links (there is nothing to skip and it clutters
// the keyboard navigation list).
$header = $OUTPUT->header();
$header = preg_replace('~<div class="skiplinks">.*?</div>~', '', $header);
$header = str_replace('</head>', '<style type="text/css">
        #page-content .region-content { overflow: visible }
        </style>', $header);

// Remove Moodle theme css
$header = preg_replace('<link rel=.*?/>', '', $header);
echo $header;

$ok = strlen(trim($eq)) > 0;
    $inlinebit = $inline ? ' mode="inline"' : '';
if ($inlinebit) {
    $text = '\\(' . s($eq) . '\\)';
} else {
    $text = '\\[' . s($eq) . '\\]';
}

$formatted = format_text($text, array('context' => get_system_context()));

// Remove link to image options.
$formatted = str_replace('</a>', '</span>', str_replace('<a ', '<span ', $formatted));

echo html_writer::tag('div', $formatted, array('class' => 'eq'));

echo html_writer::empty_tag('input', array('type' => 'hidden', 'id' => 'rand', 'value' => $rand));
echo html_writer::empty_tag('input', array('type' => 'hidden', 'id' => 'allowinsert',
        'value' => $ok ? 'y' : 'n'));

echo $OUTPUT->footer();
