/**
 * TinyMCE plugin tinytex - 'insert equation' button - modified for use with TeX only and 
 * MathJaX rendering by Mikael Kurula. All non-trivial work was done by the Open University. 
 *
 * Based on the example plugin (c) 2009 Moxiecode Systems AB
 *
 * @copyright 2013 The Open University
 * @license http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

(function() {
    tinymce.create('tinymce.plugins.tinytex', {
        containedequation : null,
        blocktags : {},
        showdebug : false,
        editor : null,

        /**
         * Initializes the plugin, this will be executed after the plugin has been created.
         *
         * @param {tinymce.Editor} ed Editor instance that the plugin is initialized in.
         * @param {string} url Absolute URL to where the plugin is located.
         */
        init : function(ed, url) {
            var t = this;
            this.editor = ed;

            // Register the command so that it can be invoked by using tinyMCE.activeEditor.execCommand('mceMoodleEmoticon');
            ed.addCommand('tinytex', function() {

                // Button doesn't work if you have something selected.
                var se = ed.selection;
                if (!se.isCollapsed()) {
                    return;
                }

                // If your cursor is inside \( \) or \[ \] tags then remember
                // the settings and include that in the iframe URL.
		// Otherwise default to inline
                var initparams = '';
                t.containedequation = t.get_contained_equation();
                if (t.containedequation) {
                    initparams = '&tab=' + t.containedequation.type + '&eq=' +
                            encodeURIComponent(t.containedequation.content);
                    if (t.containedequation.texattributes && t.containedequation.texattributes.indexOf('mode="inline"') != -1) {
                        initparams += '&inline=1';
                    }
                } else {
		    initparams += '&inline=1';
		}
	
                lang = ed.getParam('language');
                ed.windowManager.open({
                    file : ed.getParam("moodle_plugin_base") + 'tinytex/dialog.php?lang=' + lang + initparams,
                    width : 550,
                    height : 350,
                    inline : 1
                }, {
                    plugin_url : url // Plugin absolute URL
                });
            });

            // Register button.
            ed.addButton('tinytex', {
                title : 'tinytex.desc',
                cmd : 'tinytex',
                image : url + '/img/tinytex.png'
            });

            // Disable it if something is selected.
            ed.onNodeChange.add(function(ed, cm, n, co) {
                var se = ed.selection;
                cm.setDisabled('tinytex', !se.isCollapsed());
                cm.setActive('tinytex', t.get_contained_equation() != null);
            });

            // When there is a paste, see if something's added autolink for
            // MathML namespace, as this will cause problems.
            ed.onPaste.add(function(ed, e) {
                // Firefox requires one level of timeout before the link has
                // actually been pasted.
                setTimeout(function() {
                    // IE9 requires two levels of timeout.
                    setTimeout(function() {
                        ed.dom.run(ed.dom.select('a'), function(a) {
                            if (a.href.indexOf('http://www.w3.org/1998/Math/MathML') === 0) {
                                while(true) {
                                    var c = a.firstChild;
                                    if (!c) {
                                        break;
                                    }
                                    a.removeChild(c);
                                    a.parentNode.insertBefore(c, a);
                                }
                                a.parentNode.removeChild(a);
                            }
                        });
                    }, 0);
                }, 0);
            });

            // Make list of HTML block tags.
            var tags = ['ADDRESS', 'BLOCKQUOTE', 'CENTER', 'DIR', 'DIV', 'DL',
                    'FIELDSET', 'FORM', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
                    'HR', 'ISINDEX', 'MENU', 'NOFRAMES', 'NOSCRIPT', 'OL', 'P',
                     'PRE', 'TABLE', 'UL', 'DD', 'DT', 'FRAMESET', 'LI',
                     'TBODY', 'TD', 'TFOOT', 'TH', 'THEAD', 'TR'];
            for (var i = 0; i < tags.length; i++) {
                this.blocktags[tags[i]] = true;
            }
        },


// The rest of this file contains code for finding formulas in the TinyMCE editor window, that can be imported into the TeX previewer
// At the bottom there is some general information on the plugin


       get_contained_equation : function() {
            var equation = {};

            // Get selected range (must actually be a single point, so only use
            // start).
            var range = this.editor.selection.getRng(true);

            // Get text in current tags.
            var beforearr = this.get_before_text(range.startContainer, range.startOffset);
            var afterarr = this.get_after_text(range.startContainer, range.startOffset);
            var before = this.node_array_to_string(beforearr);
            var after = this.node_array_to_string(afterarr);
            var combined = before + after;
            if (this.showdebug) {
                 console.log(before + '^' + after);
            }

            // 1. This is inline TeX code, with surrounding \(  \)
            if (combined.indexOf('\\)') != -1) {
                // If there's a closing tag in the before, cut off everything before
                // the last one.
                var texbefore = before.replace(/[\S\s]*\\\)/, '');
                // If there's a closing tag in the after, cut off everything after
                // the first one.
                var texafter = after.replace(/([\S\s]*?\\\))[\S\s]*$/, '$1');

                // Combined text should now include at most one equation.
                var texcombined = texbefore + texafter;
                var re = /\\\(\s*([\S\s]*?)\s*\\\)/;
                var result = re.exec(texcombined);
                if (result) {
                    var index = result.index;
                    if(index < texbefore.length &&
                            index + result[0].length >= texbefore.length) {
                        equation.type = 'tex';
                        equation.content = result[1];
			equation.texattributes = 'mode="inline"';
                        var combinedarr = beforearr.concat(afterarr);
                        equation.range = this.convert_range(combinedarr,
                                index + (before.length - texbefore.length),
                                result[0].length);
                        return equation;
                    }
                }

            }

            // 2. This is TeX code that is not inline, surrounded by \[ \]
            if (combined.indexOf('\\]') != -1) {
                // If there's a closing tag in the before, cut off everything before
                // the last one.
                var texbefore = before.replace(/[\S\s]*\\\]/, '');
                // If there's a closing tag in the after, cut off everything after
                // the first one.
                var texafter = after.replace(/([\S\s]*?\\\])[\S\s]*$/, '$1');

                // Combined text should now include at most one equation.
                var texcombined = texbefore + texafter;
                var re = /\\\[\s*([\S\s]*?)\s*\\\]/;
                var result = re.exec(texcombined);
                if (result) {
                    var index = result.index;
                    if(index < texbefore.length &&
                            index + result[0].length >= texbefore.length) {
                        equation.type = 'tex';
                        equation.content = result[1];
			equation.texattributes = '';
                        var combinedarr = beforearr.concat(afterarr);
                        equation.range = this.convert_range(combinedarr,
                                index + (before.length - texbefore.length),
                                result[0].length);
                        return equation;
                    }
                }

            }

            return null;
        },

       /**
         * Converts an array, of the type returned by get_before/after_text,
         * to a plain string.
         * @param nodearray Array of node/text details
         * @return Text version
         */
        node_array_to_string : function(nodearray) {
            var result = '';
            for (var i = 0; i < nodearray.length; i++) {
                result += nodearray[i].text;
            }
            return result;
        },

        /**
         * Converts offset and length (within the text from a nodearray) into
         * a W3C range object.
         * @param nodearray Array of node/text details
         * @param offset Offset within text
         * @param length Length of text
         * @return Range object
         */
        convert_range : function(nodearray, offset, length) {
            var start = this.convert_point(nodearray, offset);
            var end = this.convert_point(nodearray, offset + length);
            var doc = start.container.ownerDocument;
            var range;
            if (doc.createRange) {
                range = doc.createRange();
            } else {
                // Using this range is sketchy. In non-IE browsers, modifying
                // this range will modify the selection. In IE, though, which
                // is the only place we don't have doc.createRange above, it
                // doesn't seem to be linked.
                range = this.editor.selection.getRng(true);
            }
            range.setStart(start.container, start.offset);
            range.setEnd(end.container, end.offset);
            return range;
        },

        /**
         * Converts index (within text from a nodearray) into a node and offset.
         * @param nodearray Array of node/text details
         * @param offset Offset within text
         * @return Object with container and offset fields.
         */
        convert_point : function(nodearray, offset) {
            var pos = 0;
            for (var i = 0; i < nodearray.length; i++) {
                var info = nodearray[i];
                var newpos = pos + info.text.length;
                if (offset < newpos) {
                    return { container : info.node,
                            offset : offset - pos + (info.offset ? info.offset : 0) };
                }
                pos = newpos;
            }
            // If offset matches end of the array, use the end of previous node
            if (offset == pos) {
                var info = nodearray[nodearray.length - 1];
                return { container : info.node,
                        offset : (info.offset ? info.offset : 0) + info.text.length};
            }
            throw 'Index out of range';
        },

        /**
         * Goes to previous node in document order.
         * @param nodepair Object containing 'node' (DOM node) and 'start' (boolean)
         */
        get_previous_node : function(nodepair) {
            if (nodepair.start) {
                if (nodepair.node.previousSibling) {
                    return { node : nodepair.node.previousSibling, start : false };
                } else if (nodepair.node.parentNode) {
                    return { node : nodepair.node.parentNode, start : true };
                } else {
                    return null;
                }
            } else {
                if (nodepair.node.lastChild) {
                    return { node : nodepair.node.lastChild, start : false };
                } else {
                    return { node : nodepair.node, start : true };
                }
            }
        },

        /**
         * Goes to next node in document order.
         * @param nodepair Object containing 'node' (DOM node) and 'start' (boolean)
         */
        get_next_node : function(nodepair) {
            if (nodepair.start) {
                if (nodepair.node.firstChild) {
                    return { node : nodepair.node.firstChild, start : true };
                } else {
                    return { node : nodepair.node, start : false };
                }
            } else {
                if (nodepair.node.nextSibling) {
                    return { node : nodepair.node.nextSibling, start : true };
                } else if (nodepair.node.parentNode) {
                    return { node : nodepair.node.parentNode, start : false };
                } else {
                    return null;
                }
            }
        },

        /**
         * Gets text before given cursor position. Includes text node
         * and <br/> nodes which are converted to "\n". Looks backward in
         * document order, but does not leave the current HTML block-level
         * elements.
         *
         * The return value is array of node, text. In the case of the partial
         * node around the cursor, it also has a 'length' field for how many
         * characters to use.
         *
         * @param start Text node to start from, or element node
         * @param offset Character offset within node, or child offset in element node
         * @return Array of { node, text } pairs (in forwards order!)
         */
        get_before_text  : function(start, offset) {
            var result = [];
            var nodepair;
            if (start.nodeType == 1 && offset != 0) {
                // It's an offset within a element node, need to go back from
                // the end of the node just before offset.
                nodepair = { node : start.childNodes[offset-1], start : false };
            } else {
                // Text node or start of element; go back from beginning of node.
                nodepair = { node : start, start : true };
            }
            while (true) {
                nodepair = this.get_previous_node(nodepair);
                if (nodepair === null) {
                    break;
                }
                if (nodepair.start) {
                    if (nodepair.node.nodeType == 3) {
                        result.unshift({ node : nodepair.node, text : nodepair.node.nodeValue });
                    } else if (nodepair.node.nodeType == 1) {
                        var tag = nodepair.node.tagName.toUpperCase();
                        if (tag == 'BR') {
                            result.unshift({ node : nodepair.node, text : '\n' });
                        } else if (this.blocktags[tag]) {
                            break;
                        }
                    }
                }
            }
            if (start.nodeType == 3) {
                result.push( { node : start, text : start.nodeValue.substring(0, offset), length : offset });
            }

            return result;
        },

        /**
         * Gets text after given cursor position. Includes text node
         * and <br/> nodes which are converted to "\n". Looks forward in
         * document order, but does not leave the current HTML block-level
         * elements.

         * The return value is array of node, text. In the case of the partial
         * node around the cursor, it also has an 'offset' field for how many
         * characters to skip.
         *
         * @param start Text node to start from, or element node
         * @param offset Character offset within node, or child offset in element node
         * @return Array of { node, text } pairs
         */
        get_after_text : function(start, offset) {
            var result = [];
            if (start.nodeType == 3) {
                result.push( { node : start,
                        text : start.nodeValue.substring(offset), offset : offset } );
            }
            var nodepair;
            if (start.nodeType == 1 && offset < start.childNodes.length) {
                // It's an offset within a element node, need to go from
                // the next child node.
                nodepair = { node : start.childNodes[offset], start : true };
            } else {
                // Text node or end of element; go from end of node.
                nodepair = { node : start, start : false };
            }
            while (true) {
                nodepair = this.get_next_node(nodepair);
                if (nodepair === null) {
                    break;
                }
                if (!nodepair.start) {
                    if (nodepair.node.nodeType == 3) {
                        result.push({ node : nodepair.node, text : nodepair.node.nodeValue });
                    } else if (nodepair.node.nodeType == 1) {
                        var tag = nodepair.node.tagName.toUpperCase();
                        if (tag == 'BR') {
                            result.push({ node: nodepair.node, text : '\n' });
                        } else if (this.blocktags[tag]) {
                            break;
                        }
                    }
                }
            }
            return result;
        },

        /**
         * Returns information about the plugin as a name/value array.
         * The current keys are longname, author, authorurl, infourl and version.
         *
         * @return {Object} Name/value array containing information about the plugin.
         */
        getInfo : function() {
            return {
                longname : 'MathJaX-based latex previewer, trivial modification of the OU Insert equation plugin',
                author : 'The Open University (modified for TeX code only and MathJax rendering by Mikael Kurula)',
                authorurl : 'http://users.abo.fi/mkurula/',
                infourl : 'http://www.open.ac.uk/',
                version : '0.9'
            };
        }
    });

    // Register plugin
    tinymce.PluginManager.add('tinytex', tinymce.plugins.tinytex);
})();
