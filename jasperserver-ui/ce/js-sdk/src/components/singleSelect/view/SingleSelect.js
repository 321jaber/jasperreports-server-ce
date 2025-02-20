/*
 * Copyright (C) 2005 - 2022 TIBCO Software Inc. All rights reserved.
 * http://www.jaspersoft.com.
 *
 * Unless you have purchased a commercial license agreement from Jaspersoft,
 * the following license terms apply:
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */


/**
* @author Sergey Prilukin
* @version: $Id: SingleSelect.js 2411 2016-03-14 18:03:07Z psavushc $
*/

/**
* Single select component which supports view port, and filtering via search.
*/
import $ from 'jquery';
import Backbone from 'backbone';
import _ from 'underscore';
import KeyboardManager from '../manager/KeyboardManager';
import SingleSelectList from './SingleSelectList';
import SingleSelectListModel from '../model/SingleSelectListModel';
import SearcheableDataProvider from '../dataprovider/SearcheableDataProvider';
import DropDownManager from '../manager/DropDownManager';
import singleSelectTemplate from '../templates/singleSelectTemplate.htm';
import singleSelectTemplate_IE10_11 from '../templates/singleSelectTemplate_IE10_11.htm';
import singleSelectListTemplate from '../templates/listTemplate.htm';
import singleSelectItemsTemplate from '../templates/itemsTemplate.htm';
import dropDownTemplate from '../templates/dropDownTemplate.htm';
import i18n from '../../../i18n/ScalableInputControlsBundle.properties';
import browserDetection from '../../../common/util/browserDetection';
import xssUtil from '../../../common/util/xssUtil';

var $body = $("body");

var SingleSelect = Backbone.View.extend({

    events: function() {
        return {
            "keydown": this.keyboardManager.onKeydown,
            "input": this.keyboardManager.onKeydown,
            "focus input": "onFocus",
            "blur input": "onBlur",
            "mousedown": "onMousedown",
            "mouseup": "onMouseup",
            "click .jr-mSingleselect-input": "onClickOnInput"
        };
    },

    initialize: function(options) {
        _.bindAll(this, "onGlobalMouseup", "onGlobalMousedown",
            "onGlobalMousemove", "onMousedown", "calcOffsetForListView", "collapse");

        if (!this.model) {
            this.model = new Backbone.Model();
        }

        this.model.set("expanded", false, {silent: true});
        this.model.set("criteria", "", {silent: true});
        this.model.set("value", {}, {silent: true});

        let template = singleSelectTemplate;

        // THIS IS A HACK TO COMPENSATE FOR AN IE10 and IE11 BUGS:
        // https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/274987/
        // https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/101220/
        if (browserDetection.isIE10() || browserDetection.isIE11()) {
            template = singleSelectTemplate_IE10_11;
        }

        this.dropUpDirection = false;
        this.label = options.label;
        this.template = _.template(options.template || template);
        this.dropDownTemplate = _.template(options.dropDownTemplate || dropDownTemplate);

        this.keyboardManager = new KeyboardManager({
            keydownTimeout: options.keydownTimeout,
            context: this,
            deferredKeydownHandler: this.processKeydown,
            immediateHandleCondition: this.immediateHandleCondition,
            immediateKeydownHandler: this.immediateKeydownHandler,
            stopPropagation: true
        });

        //Initialize internal list view model
        this.listViewModel = this._createListViewModel(options);

        //initialize list view
        this.listView = this._createListView(options);

        this.render();

        this.dropDownManager = new DropDownManager({
            dropDownEl: this.$dropDownElContainer,
            calcOffset: this.calcOffsetForListView,
            isOffsetChanged: this.isDimensionsChangedForListView,
            onOffsetChanged: this.collapse
        });

        this.initListeners();
        this.setValue(options.value, {
            modelOptions: {silent: true}
        });
    },

    _createListView: function(options) {
        return new SingleSelectList({
            el: options.listElement || $(singleSelectListTemplate),
            model: this.listViewModel,
            chunksTemplate: options.chunksTemplate,
            itemsTemplate: options.itemsTemplate || singleSelectItemsTemplate,
            scrollTimeout: options.scrollTimeout
        });
    },

    _createListViewModel: function(options) {
        this.searcheableDataProvider = new SearcheableDataProvider({getData: options.getData});

        return new SingleSelectListModel({
            getData: this._getGetData(),
            bufferSize: options.bufferSize,
            loadFactor: options.loadFactor
        });
    },

    _getGetData: function() {
        return this.searcheableDataProvider.getData;
    },

    _getActiveValueIndex: function(active) {
        var indexMapping = this.searcheableDataProvider.getIndexMapping();
        return indexMapping ? indexMapping[active.index] : active.index;
    },

    /*
     Bind event listeners
     */
    initListeners: function() {
        this.listenTo(this.listView, "selection:change", this.selectionChange, this);
        this.listenTo(this.listView, "item:mouseup", this.itemMouseup, this);
        this.listenTo(this.listView, "listRenderError", this.listRenderError, this);
        this.listenTo(this.model, "change:expanded", this.changeExpandedState, this);
        this.listenTo(this.model, "change:value", this.changeValue, this);
        this.listenTo(this.model, "change:disabled", this.changeDisabled, this);
        this.listenTo(this.model, "change:criteria", this.changeFilter, this);

        this.$dropDownEl.on("mousedown", this.onMousedown);

        $body.on("mousedown", this.onGlobalMousedown)
            .on("dataavailable", this.onGlobalMousedown) /* hack to handle prototype custom events */
            .on("mouseup", this.onGlobalMouseup)
            .on("mousemove", this.onGlobalMousemove);
    },

    render: function() {

        var singleSelect = $(this.template({
            label: this.label,
            isIPad: browserDetection.isIPad(),
            value: this.model.get("value").label,
            expanded: this.model.get("expanded"),
            i18n: i18n
        }));

        this.renderListView();

        this.$el.empty();
        this.$el.append(singleSelect);

        this.$singleSelect = singleSelect;
        this.$searchBlock = this.$el.find(".jr-mSingleselect-search");
        this.$inputBlock = this.$el.find(".jr-mSingleselect-input");
        this.$input = this.$searchBlock.find("input");

        return this;
    },

    renderListView: function() {
        if (!this.listRendered) {
            this.$dropDownElContainer = $(this.dropDownTemplate(
                {isIPad: navigator.platform === "iPad"}
            ));
            this.$dropDownEl = this.$dropDownElContainer.find(".jr-mSingleselect-dropdown");

            this.listView.undelegateEvents();
            this.$dropDownEl.append(this.listView.$el);
            $body.append(this.$dropDownElContainer);
            this.listView.delegateEvents();

            this.listRendered = true;
        }

        this.$scalablelist = this.$dropDownElContainer.find(".jr-mScalablelist");

        this.model.get("expanded")
            ? this.$dropDownElContainer.show()
            : this.$dropDownElContainer.hide();
    },

    renderData: function() {
        this.listView.renderData();
        return this;
    },

    /* Event handlers */
    listRenderError: function(responseStatus, error) {
        this.trigger("listRenderError", responseStatus, error);
    },

    itemMouseup: function() {
        if (this.model.get("disabled")) {
            return;
        }

        //Remove flag to allow blur
        delete this.preventBlur;

        //Preserve focus
        this.$input.focus();

        var activeValue = this.model.get("activeValue");

        if (activeValue.value !== this.model.get("value").value) {
            this.model.unset("activeValue");
            this.model.set("value", activeValue);
        } else {
            this.collapse();
        }
    },

    selectionChange: function() {
        var active = this.listView.getActiveValue();

        if (active) {
            this.listView.scrollTo(active.index);

            this.model.set("activeValue", {
                value: active.value,
                label: active.label,
                index: this._getActiveValueIndex(active)
            });

            this.updateValueFromActive();
        } else {
            this.model.unset("activeValue");
        }
    },

    onClickOnInput: function() {
        this.model.get("expanded") ? this.collapse() : this.expand();
    },

    onFocus: function() {
        if (!this.model.get("expanded")) {
            this.$inputBlock.addClass("jr-isFocused")
        }
    },

    onBlur: function() {
        if (!this.preventBlur) {
            this.collapse();

            this.$inputBlock.removeClass("jr-isFocused");
        }
    },

    onMousedown: function() {
        this.preventBlur = true;
    },

    onMouseup: function() {
        if (this.preventBlur) {
            delete this.preventBlur;

            if (this.model.get("expanded")) {
                this.$input.focus();
            }
        }
    },

    changeExpandedState: function(model) {
        if (model.get("expanded")) {
            this.doExpand();
        } else {
            this.doCollapse();
        }
    },

    changeValue: function() {
        this.collapse();
        this.updateControlLabel();

        if (!this.silent) {
            this.trigger("selection:change", this.model.get("value").value);
        } else {
            delete this.silent;
        }

        this.$input.val("");
        this.model.set("criteria", "");
    },

    changeDisabled: function() {
        var disabled = this.model.get("disabled");

        if (disabled) {
            this.$input.attr("disabled", "disabled");
            this.collapse();
        } else {
            this.$input.removeAttr("disabled");
        }

        this.listView.setDisabled(disabled);
    },

    onGlobalMousedown: function(event) {
        if (this.model.get("expanded")) {
            if (event.target === this.el || this.$el.find(event.target).length > 0 ||
                event.target === this.$dropDownEl[0] || this.$dropDownEl.find(event.target).length > 0) {
                //Do not collapse if mousedown performed on this component
                this.$input.focus();
                return;
            }

            this.preventBlur = false;
        }
        this.onBlur();
    },

    onGlobalMouseup: function() {
        this.onMouseup();
    },

    onGlobalMousemove: function(event) {
        if (this.preventBlur) {
            event.stopPropagation();
        }
    },

    /* Key handlers for KeyboardManager */

    onUpKey: function() {
        if (!this.model.get("expanded")) {
            this.expand();
        } else {
            var active = this.listView.getActiveValue();

            if (!active || active.index === 0) {
                this.collapse();
                return;
            } else {
                this.listView.activatePrevious();
            }
        }
    },

    onDownKey: function() {
        if (!this.model.get("expanded")) {
            this.expand();
        } else {
            var active = this.listView.getActiveValue();

            if (active) {
                this.listView.activateNext();
            } else {
                this.listView.activateFirst();
            }
        }
    },

    onEnterKey: function(event) {
        event.preventDefault();

        if (!this.model.get("expanded")) {
            this.expand();
        } else {
            if (this.model.get("activeValue")) {
                this.itemMouseup();
            } else {
                this.collapse();
            }
        }
    },

    onEscKey: function() {
        if (this.model.get("expanded")) {
            this.collapse();
        }
    },

    onHomeKey: function() {
        if (!this.model.get("expanded")) {
            this.expand();
        } else {
            this.listView.activateFirst();
        }
    },

    onEndKey: function() {
        if (!this.model.get("expanded")) {
            this.expand();
        } else {
            this.listView.activateLast();
        }
    },

    onPageUpKey: function() {
        if (!this.model.get("expanded")) {
            this.expand();
        } else {
            this.listView.pageUp();
        }
    },

    onPageDownKey: function() {
        if (!this.model.get("expanded")) {
            this.expand();
        } else {
            this.listView.pageDown();
        }
    },

    onTabKey: function() {
        /* do nothing */
    },

    /* Internal helper methods */

    updateDropDirection: function() {
        // calc max height up and down
        var scrollHeight = $("html").scrollTop();
        var offset = this.$el.offset();
        var elHeight = this.$el.height();
        var searchBlockHeight = this.$searchBlock.outerHeight();

        var topHeight = offset.top - scrollHeight;
        var bottomHeight = $(window).height() - topHeight - elHeight;

        this.dropUpDirection = topHeight > bottomHeight;

        // set list max height
        var maxSize = this.dropUpDirection ? topHeight : (bottomHeight);
        maxSize -= searchBlockHeight + elHeight;

        this.$scalablelist.css("max-height", (maxSize) + "px");
    },

    doExpand: function() {
        this.updateDropDirection();

        if (this.dropUpDirection) {
            this.$dropDownEl.addClass("jr-mSingleselect-dropdownTop");
            this.$singleSelect.addClass("jr-mSingleselectTop");
        }

        this.$searchBlock.addClass("jr-isOpen");
        this.$inputBlock.addClass("jr-isOpen");
        this.$inputBlock.removeClass("jr-isFocused");
        this.$input.focus();

        this.listView.onScroll();
        this.expandListView();

        if (this.listView.lazy) {
            this.listView.fetch(_.bind(this.listView.resize, this.listView));
        } else {
            this.listView.resize();
        }

        if (typeof this.model.get("value").value !== "undefined") {
            this.setValueToList();
        }

        this.trigger("expand", this);
    },

    expandListView: function() {
        this.$dropDownElContainer.show();
        this.dropDownManager.startCalc();
    },

    doCollapse: function() {
        this.model.unset("activeValue");
        this.$searchBlock.removeClass("jr-isOpen");
        this.$inputBlock.removeClass("jr-isOpen");

        this.$dropDownEl.removeClass("jr-mSingleselect-dropdownTop");
        this.$singleSelect.removeClass("jr-mSingleselectTop");

        this.$inputBlock.addClass("jr-isFocused");
        this.$input.val("");
        this.$dropDownElContainer.hide();
        this.model.set("criteria", "");
        this.dropDownManager.stopCalc();
        this.trigger("collapse", this);
    },

    calcOffsetForListView: function() {
        var top;
        var offset = this.$el.offset();
        var left = $body.offset().left + offset.left;
        var elHeight = this.$el.height();

        if (this.dropUpDirection) {
            top = $body.offset().top + offset.top  - this.$searchBlock.outerHeight();
        } else {
            top = $body.offset().top + offset.top + elHeight + this.$searchBlock.height();
        }


        return {
            top: top,
            left: left,
            width: this.el.getBoundingClientRect().width
        }
    },

    isDimensionsChangedForListView: function(currentDimensions, newDimensions) {
        // we allow some slight change in dimensions which we don't notice as a change
        const threshold = 2;
        return (Math.abs(currentDimensions.top - newDimensions.top) > threshold
            || Math.abs(currentDimensions.left - newDimensions.left) > threshold);
    },

    immediateHandleCondition: function(event) {
        return !this.model.get("expanded");
    },

    immediateKeydownHandler: function(event) {
        this.expand();
        this.keyboardManager.deferredHandleKeyboardEvent(event);
    },

    processKeydown: function() {
        this.model.set("criteria", this.$input.val());
    },

    changeFilter: function() {
        var that = this;
        this._getGetData()({criteria: this.model.get("criteria")}).done(function() {
            that.listView.fetch(function () {
                that.setValueToList();
            });
        });
    },

    setValueToList: function(options) {
        var value = this.model.get("value");

        var selection = value.value;

        if (typeof value.index !== "undefined") {
            var indexMapping = this.searcheableDataProvider.getReverseIndexMapping();

            var index = (indexMapping ? indexMapping[value.index] : value.index);
            selection = {};

            if (typeof index !== "undefined") {
                selection[index] = value.value;
            }
        }

        this.listView.setValue(selection, options);
    },

    //value is external usual value: either string, or array of strings or object
    convertExternalValueToInternalFormat: function(value) {
        var internalValue = {};

        if (typeof value !== "undefined") {
            if (typeof value === "string" || value === null) {
                internalValue = {value: value};
            } else {
                for (var index in value) {
                    if (value.hasOwnProperty(index) && value[index] !== undefined) {

                        if (typeof value[index] === 'object') {
                            internalValue = {
                                value: value[index].value,
                                index: parseInt(index, 10),
                                label: value[index].label
                            };
                        } else {
                            internalValue = {
                                value: value[index],
                                index: parseInt(index, 10)
                            };
                        }
                        break;
                    }
                }
            }
        }

        return internalValue;
    },

    updateValueFromActive: function() {
        var value = this.model.get("value");
        var activeValue = this.model.get("activeValue");

        if (value.value === activeValue.value && typeof value.label === "undefined") {
            value.label = activeValue.label;
            this.updateControlLabel();
        }
    },

    updateControlLabel: function() {
        var value = this.model.get("value");
        var $inputBlockPlaceholder = this.$inputBlock.find(".jr-mSingleselect-input-placeholder");
        var $inputBlockSelection = this.$inputBlock.find(".jr-mSingleselect-input-selection");
        var label;

        if (_.isEmpty(value) || value.value == null){
            $inputBlockPlaceholder.removeClass("jr-isHidden");
            this.render();
        } else {
            label = this.getControlLabelByValue(value);
            $inputBlockPlaceholder.addClass("jr-isHidden");
            this.$inputBlock.attr("title", label);
            $inputBlockSelection.html(xssUtil.hardEscape(label));
        }
    },

    getControlLabelByValue: function (value) {
        return value.label == null
            ? value.value
            : value.label;
    },

    /* API */

    fetch: function(callback, options) {
        this.listView.fetch(callback, options);
        return this;
    },

    reset: function(options) {
        this.listView.reset(options);
        return this;
    },

    expand: function() {
        if (this.model.get("disabled")) {
            return;
        }

        this.model.set("expanded", true);
        return this;
    },

    collapse: function() {
        this.model.set("expanded", false);
        return this;
    },

    getValue: function() {
        return this.model.get("value").value;
    },

    setValue: function(value, options) {
        value = this.convertExternalValueToInternalFormat(value);

        if (options && options.silent) {
            this.silent = true;
        }

        this.model.set("value", value);
        this.setValueToList();
    },

    setDisabled: function(disabled) {
        this.model.set("disabled", disabled);
        return this;
    },

    getDisabled: function() {
        return this.model.get("disabled");
    },

    remove: function() {
        this.$dropDownEl.off("mousedown", this.onMousedown).remove();
        this.listView.remove();
        this.$dropDownElContainer.remove();
        Backbone.View.prototype.remove.call(this);
        $body.off("mousedown", this.onGlobalMousedown)
            .off("dataavailable", this.onGlobalMousedown)
            .off("mouseup", this.onGlobalMouseup)
            .off("mousemove", this.onGlobalMousemove);
    }
});

export default SingleSelect;
