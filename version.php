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
 * TinyMCE OU maths plugin version details.
 * The original plugin developed by The Open University was later modified
 * for TeX-only use with MathJaX rendering by Mikael Kurula/Abo Akademi University.
 * (The OU version of the plugin has additional dependencies to allow it to process
 * MathML code as well.)
 *
 * @package tinymce_tinytex
 * @copyright 2013 The Open University
 * @license http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

$plugin->version   = 2014012006;
$plugin->requires  = 2012112900;
$plugin->cron      = 0;
$plugin->component = 'tinymce_tinytex';
$plugin->maturity  = MATURITY_BETA;
$plugin->release   = 'v0.9';

$plugin->dependencies = array(
    'editor_tinymce' => ANY_VERSION,
);
