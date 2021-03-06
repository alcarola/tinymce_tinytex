var tinytex_dialog = {
    UPDATE_PAUSE : 300,

    iframeheight : 100,
    lasttext : '',
    lastinline : false,
    lastchange : 0,
    pending : false,
    updating : false,
    type : null,
    ie8 : false,
    horribleresize : null,

    init : function() {
        // Detect IE8 and IE7. The latter check would be inaccurate in case
        // of compabitility mode, but we use headers to turn off compatibility
        // mode so it's OK.
        this.ie8 = navigator.userAgent.indexOf('Trident/4.0') != -1;
        this.ie7 = navigator.userAgent.indexOf('Mozilla/4.0 (compatible; MSIE 7.0') === 0;

        // Register event handler to make the preview the right size.
        if (this.ie8 || this.ie7) {
            this.horribleresize = function() {
                tinytex_dialog.resize_preview();
                setTimeout(tinytex_dialog.horribleresize, 250);
            };
        } else {
            document.getElementsByTagName('body')[0].onresize =
                    function(e) { tinytex_dialog.resize_preview(); };
        }
        // Register event handler for the code box.
        var code = document.getElementById('code');
        setInterval(function() { tinytex_dialog.check_code(); }, 100);
        // Register key handlers for tabs.
        var tabs = document.getElementsByTagName('li');
        for(var i=0; i<tabs.length; i++) {
            tabs[i].onkeypress = this.tab_function(tabs[i]);
        }
        // Resize and also set focus now.
        setTimeout(function() {
            if(tinytex_dialog.ie8 || tinytex_dialog.ie7) {
                tinytex_dialog.horribleresize();
            } else {
                tinytex_dialog.resize_preview();
            }
            code.focus();
        } , 0);
        // Check what type it is
        var form = document.getElementById('invisibleform');
        this.type = form.elements.type.value;
    },

    tab_function : function(tab) {
        return function(e) {
            var ev = e ? e : event;
            if(ev.keyCode == 13) {
                location.href = tab.getElementsByTagName('a')[0].href;
            }
        };
    },

    check_code : function() {
        var code = document.getElementById('code');
        var inlinecheck = document.getElementById('inline');
        var inline = inlinecheck ? inlinecheck.checked : false;
        var now = new Date().getTime();
        if (this.lasttext == code.value && this.lastinline == inline) {
            if (this.pending && now > this.lastchange + this.UPDATE_PAUSE && !this.updating) {
                this.pending = false;
                this.update();
            }
            return;
        }
        this.lasttext = code.value;
        this.lastinline = inline;
        this.lastchange = now;
        this.pending = true;
        document.getElementById('insert').disabled = true;
    },

    update : function() {
        this.updating = true;
        var form = document.getElementById('invisibleform');
        form.elements.eq.value = this.lasttext;
        form.elements.inline.value = this.lastinline ? 1 : 0;
        form.elements.rand.value = (Math.random() + '').replace('.', '_');
        form.submit();
        var iframe = document.getElementById('iframe');

        var t = this;
        var checkfinished = function() {
            var doc = iframe.contentDocument || iframe.contentWindow.document;
            if (doc && doc.getElementById('rand') &&
                    doc.getElementById('rand').value == form.elements.rand.value) {
                // OK the document is loaded, allow update again (in 300ms)
                t.updating = false;
                t.lastchange = new Date().getTime();
                document.getElementById('insert').disabled =
                        (doc.getElementById('allowinsert').value != 'y');
            } else {
                // Document not loaded yet, try again
                setTimeout(checkfinished, 100);
            }
        };
        setTimeout(checkfinished, 100);
    },

    resize_preview : function() {
        // Figure out how far the buttons are from the bottom.
        var buttons = document.getElementById('buttons');
        var pad = 2;
        var belowbuttons = buttons.offsetTop + buttons.offsetHeight + pad;
        var parentheight = document.documentElement.clientHeight;
        if (belowbuttons == parentheight) {
            return;
        }

        // Work out new preview height.
        var min = 50;
        this.iframeheight += (parentheight - belowbuttons);
        if (this.iframeheight < min) {
            if (this.iframeheight == min) {
                return;
            }
            this.iframeheight = min;
        }

        // Special case for IE8 where this calculation doesn't work right.
        if (this.ie8 || this.ie7) {
            this.iframeheight -= 6;
        }

        // Adjust preview.
        var preview = document.getElementById('iframe');
        preview.style.height = this.iframeheight + 'px';
    },

    insert : function(replace) {
        // I don't know what this line is for?
        if (tinymce.isIE) {
            tinyMCEPopup.restoreSelection();
        }
        // Get the existing equation from editor. If there is one, select it.
        var editor = tinyMCEPopup.editor;
        var eq = editor.plugins['tinytex'].containedequation;
        if (eq) {
            editor.selection.setRng(eq.range);
        }

        var code = document.getElementById('code');
        var inlinecheck = document.getElementById('inline');
        var inline = inlinecheck ? inlinecheck.checked : false;
        var v = code.value;
        // Trim
        v = v.replace(/^\s*|\s*$/g, '');
        // Escape
        v = v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        // Line breaks
        var newv = v.replace(/\n/g, "<br/>");

        // Get TeX attributes.
        var texattributes = (eq && eq.texattributes) ? eq.texattributes : '';

        // Modify attributes for inline if required.
        if (this.type == 'tex') {
            if (texattributes.indexOf('mode="inline"') != -1 && !inline) {
                texattributes = texattributes.replace('mode="inline"', '');
            } else if (texattributes.indexOf('mode="inline"') == -1 && inline) {
                texattributes += ' mode="inline"';
            }
            if (texattributes.match(/^\s*$/)) {
                texattributes = '';
            }
        }

        if (newv != v || texattributes) {
            var separator = (newv != v) ? '<br />' : ' ';
            v = newv;
            if (this.type == 'tex') {
            v = '\\( ' + v + ' \\)';
            }
        }
        else if(this.type == 'tex') {
            v = '\\[ ' + v + ' \\]'
        }

        editor.execCommand('mceInsertContent', false, v);
        tinyMCEPopup.close();
    }
};

tinyMCEPopup.onInit.add(tinytex_dialog.init, tinytex_dialog);
