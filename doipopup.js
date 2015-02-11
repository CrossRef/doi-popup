+function ($) {
    'use strict';

    var citeprocJsonMetadataParser = function(data) {
	return data;
    };
    
    var DoiPopup = function (element, options) {
	this.init('doiPopup', element, options);

	var doi = this.getDoi();
	var o = this.options;

	$.ajax({
	    url: 'http://dx.doi.org/' + doi,
	    headers: {'Accept': o.metadataContentType}
	}).success(function(data, status, xhr) {
	    var linkHeader = xhr.getResponseHeader('Link');
	    var metadata = o.metadataParser(data);
	    
	    o.content = metadata['title'] + linkHeader;
	});
    };

    if (!$.fn.tooltip) throw new Error('DoiPopup requires tooltip.js');

    DoiPopup.VERSION  = '1.0.0';

    DoiPopup.DEFAULTS = $.extend({}, $.fn.tooltip.Constructor.DEFAULTS, {
	doi: '',
	placement: 'right',
	trigger: 'click',
	metadataContentType: 'application/vnd.citationstyles.csl+json',
	metadataParser: citeprocJsonMetadataParser,
	content: '',
	template: '<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
    });

    DoiPopup.prototype = $.extend({}, $.fn.tooltip.Constructor.prototype);
    
    DoiPopup.prototype.constructor = DoiPopup

    DoiPopup.prototype.getDefaults = function () {
	return DoiPopup.DEFAULTS
    }

    DoiPopup.prototype.setContent = function () {
	var $tip    = this.tip();
	var title   = this.getTitle();
	var content = this.getContent();

	$tip.find('.popover-title')[this.options.html ? 'html' : 'text'](title)
	$tip.find('.popover-content').children().detach().end()[
	    // we use append for html objects to maintain js events
	    this.options.html ? (typeof content == 'string' ? 'html' : 'append') : 'text'
	](content)

	$tip.removeClass('fade top bottom left right in')

	// IE8 doesn't accept hiding via the `:empty` pseudo selector, we have to do
	// this manually by checking the contents.
	if (!$tip.find('.popover-title').html()) $tip.find('.popover-title').hide()
    }

    DoiPopup.prototype.hasContent = function () {
	return this.getDoi();
    };

    DoiPopup.prototype.getContent = function () {
	var $e = this.$element;
	var o  = this.options;

	return $e.attr('data-content')
	    || (typeof o.content == 'function' ?
		o.content.call($e[0]) :
		o.content);
    };

    DoiPopup.prototype.getDoi = function () {
	var doi;
	var o = this.options;

	doi = o.doi
	    || $("meta[name='dc.identifier']").text();

	return doi;
    };

    DoiPopup.prototype.arrow = function () {
	return (this.$arrow = this.$arrow || this.tip().find('.arrow'));
    };

    DoiPopup.prototype.tip = function () {
	if (!this.$tip) {
	    this.$tip = $(this.options.template);
	}
	
	return this.$tip;
    };

    function Plugin(option) {
	return this.each(function () {
	    var $this   = $(this);
	    var data    = $this.data('bs.doiPopup');
	    var options = typeof option == 'object' && option;
	    
	    if (!data && option == 'destroy') {
		return;
	    }
	    
	    if (!data) {
		$this.data('bs.doiPopup', (data = new DoiPopup(this, options)));
	    }
	    
	    if (typeof option == 'string') {
		data[option]();
	    }
	});
    }

    var old = $.fn.popover;

    $.fn.doiPopup             = Plugin;
    $.fn.doiPopup.Constructor = DoiPopup;
    
    $.fn.doiPopup.noConflict = function () {
	$.fn.doiPopup = old;
	return this;
    };
    
}(jQuery);
