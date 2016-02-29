'use strict';

let _ = require('underscore');
let jquery = require('jquery');

let Modal = function(el, options) {
    Modal.close(); // Close any open modals.
    let remove, target;
    this.$body = jquery('body');
    this.options = _.extend({}, Modal.defaults, options);
    this.options.doFade = false;
    this.$elm = el;
    this.$body.append(this.$elm);
    this.open();
    Modal.current = this;
};

Modal.current = null;

Modal.prototype = {
    constructor: Modal,

    open: function() {
        let m = this;
        if (this.options.doFade) {
            this.block();
            setTimeout(function() {
                m.show();
            }, this.options.fadeDuration * this.options.fadeDelay);
        } else {
            this.block();
            this.show();
        }
        if (this.options.escapeClose) {
            jquery(document).on('keydown.modal', function(event) {
                if (event.which == 27) Modal.close();
            });
        }
        if (this.options.clickClose) this.blocker.click(function(e) {
            if (e.target == this)
                Modal.close();
        });
    },

    close: function() {
        this.unblock();
        this.hide();
        jquery(document).off('keydown.modal');
    },

    block: function() {
        this.$elm.trigger(Modal.BEFORE_BLOCK, [this._ctx()]);
        this.blocker = jquery('<div class="jquery-modal blocker"></div>');
        this.$body.css('overflow', 'hidden');
        this.$body.append(this.blocker);
        if (this.options.doFade) {
            this.blocker.css('opacity', 0).animate({
                opacity: 1
            }, this.options.fadeDuration);
        }
        this.$elm.trigger(Modal.BLOCK, [this._ctx()]);
    },

    unblock: function() {
        if (this.options.doFade) {
            let self = this;
            this.blocker.fadeOut(this.options.fadeDuration, function() {
                self.blocker.children().appendTo(self.$body);
                self.blocker.remove();
                self.$body.css('overflow', '');
            });
        } else {
            this.blocker.children().appendTo(this.$body);
            this.blocker.remove();
            this.$body.css('overflow', '');
        }
    },

    show: function() {
        let self = this;
        this.$elm.trigger(Modal.BEFORE_OPEN, [this._ctx()]);
        if (this.options.showClose) {
            this.closeButton = jquery('<a href="javascript:;" class="close-modal ' + this.options.closeClass + '">' + this.options.closeText + '</a>');
            this.$elm.append(this.closeButton);
            this.closeButton.click(function() {
                self.close();
            });
        }
        this.$elm.addClass(this.options.modalClass + ' current');
        this.$elm.appendTo(this.blocker);
        if (this.options.doFade) {
            this.$elm.css('opacity', 0).show().animate({
                opacity: 1
            }, this.options.fadeDuration);
        } else {
            this.$elm.show();
        }
        this.$elm.trigger(Modal.OPEN, [this._ctx()]);
    },

    hide: function() {
        this.$elm.trigger(Modal.BEFORE_CLOSE, [this._ctx()]);
        if (this.closeButton) this.closeButton.remove();
        this.$elm.removeClass('current');

        let self = this;
        if (this.options.doFade) {
            this.$elm.fadeOut(this.options.fadeDuration, function() {
                self.$elm.trigger(Modal.AFTER_CLOSE, [self._ctx()]);
            });
        } else {
            this.$elm.hide(0, function() {
                self.$elm.trigger(Modal.AFTER_CLOSE, [self._ctx()]);
            });
        }
        this.$elm.trigger(Modal.CLOSE, [this._ctx()]);
    },

    showSpinner: function() {
        if (!this.options.showSpinner) return;
        this.spinner = this.spinner || jquery('<div class="' + this.options.modalClass + '-spinner"></div>')
            .append(this.options.spinnerHtml);
        this.$body.append(this.spinner);
        this.spinner.show();
    },

    hideSpinner: function() {
        if (this.spinner) this.spinner.remove();
    },

    //Return context for custom events
    _ctx: function() {
        return {
            elm: this.$elm,
            blocker: this.blocker,
            options: this.options
        };
    }
};

Modal.close = function(event) {
    if (!Modal.current) return;
    if (event) event.preventDefault();
    Modal.current.close();
    let that = Modal.current.$elm;
    Modal.current = null;
    return that;
};

// Returns if there currently is an active modal
Modal.isActive = function() {
    return Modal.current ? true : false;
}

Modal.defaults = {
    escapeClose: true,
    clickClose: true,
    closeText: 'Close',
    closeClass: '',
    modalClass: "modal",
    spinnerHtml: null,
    showSpinner: true,
    showClose: true,
    fadeDuration: null, // Number of milliseconds the fade animation takes.
    fadeDelay: 1.0 // Point during the overlay's fade-in that the modal begins to fade in (.5 = 50%, 1.5 = 150%, etc.)
};

// Event constants
Modal.BEFORE_BLOCK = 'modal:before-block';
Modal.BLOCK = 'modal:block';
Modal.BEFORE_OPEN = 'modal:before-open';
Modal.OPEN = 'modal:open';
Modal.BEFORE_CLOSE = 'modal:before-close';
Modal.CLOSE = 'modal:close';
Modal.AFTER_CLOSE = 'modal:after-close';
Modal.AJAX_SEND = 'modal:ajax:send';
Modal.AJAX_SUCCESS = 'modal:ajax:success';
Modal.AJAX_FAIL = 'modal:ajax:fail';
Modal.AJAX_COMPLETE = 'modal:ajax:complete';

module.exports = Modal;

