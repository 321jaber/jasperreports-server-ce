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
 * @author Sergey Prilukin; modified by Ken Penn
 * @version: $Id: AvailableItemsList.js 812 2015-01-27 11:01:30Z psavushchik $
 */

/**
 * AvailableItems list -  Part of Tabbed MultiSelect
 */

import $ from 'jquery';
import Backbone from 'backbone';
import _ from 'underscore';
import browserDetection from '../../../common/util/browserDetection';
import i18n from '../../../i18n/ScalableInputControlsBundle.properties';

import KeyboardManager from '../../singleSelect/manager/KeyboardManager';
import ListWithNavigation from '../../scalableList/view/ListWithNavigation';

import doCalcOnVisibleNodeClone from '../../scalableList/util/domAndCssUtil';

import listWithNavigationModelTrait from '../../scalableList/model/listWithNavigationModelTrait';
import ListWithSelectionAsObjectHashModel from '../../scalableList/model/ListWithSelectionAsObjectHashModel';
import scalableListItemHeightCalculationTrait from '../mixin/scalableListItemHeightCalculationTrait';
import availableItemsTabTemplate from '../templates/availableItemsTemplate.htm';
import availableItemsTabTemplate_IE10_11 from '../templates/availableItemsTemplate_IE10_11.htm';
import listTemplate from '../templates/listTemplate.htm';

let doCalcOnVisibleNodeCloneObject = doCalcOnVisibleNodeClone.doCalcOnVisibleNodeClone;

var BUTTON_TESTS = [
    {
        selector: ".jr-jSelectAll",
        strings: [
            i18n["sic.multiselect.selectAll"],
            i18n["sic.multiselect.all"],
            ""
        ]
    },
    {
        selector: ".jr-jSelectNone",
        strings: [
            i18n["sic.multiselect.deselectAll"],
            i18n["sic.multiselect.none"],
            ""
        ]
    },
    {
        selector: ".jr-jInvert",
        strings: [
            i18n["sic.multiselect.inverse"],
            ""
        ]
    }
];

var AvailableItemsList = Backbone.View.extend({

    className: "jr-mMultiselect-listContainer jr-isActive jr",

    events: function() {
        return {
            "keydown input.jr-mInput-search": this.keyboardManager.onKeydown,
            "focus input.jr-mInput-search": "onFocus",
            "blur input.jr-mInput-search": "onBlur",
            "click .jr-jSelectAll": "onSelectAll",
            "click .jr-jSelectNone": "onSelectNone",
            "click .jr-jInvert": "onInvertSelection",
            "click input.jr-mInput-search": "onClickOnInput",
            "touchend input.jr-mInput-search": "onClickOnInput",
            "mousedown": "onMousedown",
            "mouseup": "onMouseup"
        };
    },

    keydownHandlers: _.extend({
        "65": "onAKey"
    }, KeyboardManager.prototype.keydownHandlers),

    initialize: function(options) {
        _.bindAll(this, "onGlobalMouseup", "onGlobalMousedown", "onResize", "onGlobalMousemove",
            "onMousedown", "onMouseup", "onEscKey", "onSelectAll", "onSelectNone",
            "onInvertSelection");

        this._debouncedOnResize = _.debounce(this.onResize, 500);

        if (!this.model) {
            this.model = new Backbone.Model();
        }

        this.model.set("criteria", "", {silent: true});

        // THIS IS A HACK TO COMPENSATE FOR AN IE10 and IE11 BUGS:
        // https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/274987/
        // https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/101220/
        let template;

        if (browserDetection.isIE10() || browserDetection.isIE11()) {
            template = availableItemsTabTemplate_IE10_11;
        } else {
            template = availableItemsTabTemplate;
        }

        this.label = options.label;
        this.caseSensitiveSelection = options.caseSensitiveSelection;
        this.template = _.template(options.availableItemsTemplate || template);

        this.keyboardManager = new KeyboardManager({
            keydownHandlers: this.keydownHandlers,
            keydownTimeout: options.keydownTimeout,
            context: this,
            deferredKeydownHandler: this.processKeydown,
            immediateHandleCondition: this.immediateHandleCondition,
            immediateKeydownHandler: this.immediateKeydownHandler,
            stopPropagation: true
        });

        this.listViewModel = this._createListViewModel(options);

        this.setValue(options.value, {silent: true});

        this.listView = this._createListView(options);

        this.render();

        this.initListeners();
    },

    _createListViewModel: function(options) {
        this.getData = options.getData;

        var Model = ListWithSelectionAsObjectHashModel.extend(listWithNavigationModelTrait);

        return options.listViewModel || new Model({
            getData: options.getData,
            bufferSize: options.bufferSize,
            loadFactor: options.loadFactor,
            caseSensitiveSelection: options.caseSensitiveSelection
        });
    },

    _createListView: function(options) {
        var list = options.listView || new ListWithNavigation({
            el: options.listElement || $(listTemplate),
            model: this.listViewModel,
            chunksTemplate: options.chunksTemplate,
            itemsTemplate: options.itemsTemplate,
            scrollTimeout: options.scrollTimeout,
            lazy: true,
            selectedClass: "jr-isSelected",
            selection: {
                allowed: true,
                multiple: true
            }
        });

        _.extend(list, scalableListItemHeightCalculationTrait);

        return list;
    },

    initListeners: function() {
        this.listenTo(this.listView, "active:changed", this.activeChange, this);
        this.listenTo(this.listView, "mousedown", this.onMousedown, this);
        this.listenTo(this.listView, "render:data", this.onRenderData, this);
        this.listenTo(this.listView, "listRenderError", this.listRenderError, this);
        this.listenTo(this.listViewModel, "change", this.onListViewModelChanged, this);
        this.listenTo(this.listViewModel, "selection:clear", this.selectionClear, this);
        this.listenTo(this.listViewModel, "selection:add", this.selectionAdd, this);
        this.listenTo(this.listViewModel, "selection:addRange", this.selectionAddRange, this);
        this.listenTo(this.listViewModel, "selection:remove", this.selectionRemove, this);

        this.listenTo(this.model, "change:totalValue", this.onChangeTotalValue, this);
        this.listenTo(this.model, "change:value", this.changeValue, this);
        this.listenTo(this.model, "change:disabled", this.changeDisabled, this);
        this.listenTo(this.model, "change:criteria", this.changeFilter, this);

        $("body").on("mousedown", this.onGlobalMousedown)
            .on("mouseup", this.onGlobalMouseup)
            .on("mousemove", this.onGlobalMousemove);

        $(window).on("resize", this._debouncedOnResize);
    },

    render: function() {

        this.$el.empty();
        this.$el.append($(this.template(this.getModelForRendering())));

        this.listView.undelegateEvents();

        this.$el.find('.jr-mMultiselect-list').append(this.listView.el);

        this.listView.render();

        this.listView.fetch(_.bind(this.listView.resize, this.listView));

        this.listView.delegateEvents();

        this._tuneCSS();

        this.setBulkSelectionText();

        return this;
    },

    _tuneCSS: function() {
        var self = this;

        // only need to do this once
        if (!this._paddingHeightsSet) {

            doCalcOnVisibleNodeCloneObject({
                el: this.$el,
                css: {"width": "500px"},
                classes: "jr " + (browserDetection.isIPad() ? "ipad" : ""),
                callback: function($el) {
                    self.searchBarHeight = Math.round($el.find(".jr-mMultiselect-search").outerHeight());
                    self.buttonsContainerHeight = Math.round($el.find(".jr-mMultiselect-buttonContainer").outerHeight());
                }
            });

            this._paddingHeightsSet = true;
        }

        this.$el.find(".jr-mMultiselect-list").css({
            "height": "100%",
            "padding-top": this.searchBarHeight,
            "padding-bottom": this.buttonsContainerHeight
        });
    },

    renderData: function() {
        this.listView.renderData();
        return this;
    },

    /* Event Handlers */

    activeChange: function(active) {
        if (active) {
            if (this.activeChangedWithShift) {
                delete this.activeChangedWithShift;
                this.listViewModel.addRangeToSelection(active.value, active.index);
            }

            this.listView.scrollTo(active.index);
        }
    },

    selectionAdd: function(selection) {
        const currentValues = this.model.get("value");
        if (this.caseSensitiveSelection) {
            currentValues[selection.value] = true;
        } else {
            currentValues[selection.value.toLowerCase()] = selection.value;
        }
        this.model.trigger("change:value");
    },

    selectionAddRange: function(range) {
        const selection = range.selection,
            currentValues = this.model.get("value");

        for (let i = 0; i < selection.length; i +=1 ) {
            const value = selection[i];
            if (this.caseSensitiveSelection) {
                currentValues[value] = true;
            } else {
                currentValues[value.toLowerCase()] = value;
            }
        }

        this.model.trigger("change:value");
    },

    selectionRemove: function(selection) {
        const currentValues = this.model.get("value");
        if (this.caseSensitiveSelection) {
            delete currentValues[selection.value];
        } else {
            delete currentValues[selection.value.toLowerCase()];
        }

        this.model.trigger("change:value");
    },

    selectionClear: function() {
        this.model.attributes.value = {};
    },

    onSelectAll: function() {
        if (!this.model.get("disabled")) {
            this.listView.once("selection:change", this.processSelectionThroughApi, this);
            this.clearFilter(_.bind(this.listView.selectAll, this.listView));
        }
    },

    onSelectNone: function() {
        if (!this.model.get("disabled")) {
            this.listView.once("selection:change", this.processSelectionThroughApi, this);
            this.clearFilter(_.bind(this.listView.selectNone, this.listView));
        }
    },

    onInvertSelection: function() {
        if (!this.model.get("disabled")) {
            this.listView.once("selection:change", this.processSelectionThroughApi, this);
            this.clearFilter(_.bind(this.listView.invertSelection, this.listView));
        }
    },

    onRenderData: function() {
        this.trigger("render:data");
    },

    listRenderError: function(responseStatus, error) {
        this.trigger("listRenderError", responseStatus, error);
    },

    onListViewModelChanged: function() {
        if (typeof this.model.get("totalValues") == "undefined") {
            var total = this.listViewModel.get("total");

            if (_.isNumber(total) && !_.isNaN(total)) {
                this.model.set("totalValues", total);
            }
        }
    },

    onChangeTotalValue: function() {
        this.listView.resize();
    },

    setBulkSelectionText: function() {
        if (!this.$el.is(":visible")) {
            //We can not measure bulk buttons width
            //so no text will be changed
            return;
        }

        var componentWidth = this.$el.outerWidth();

        if (componentWidth === this._componentWidth) {
            //no need to check text since size was not changed since last check
            return;
        } else {
            this._componentWidth = componentWidth;
        }

        var $bulkButtonsBar = this.$el.find(".jr-mMultiselect-buttonContainer"),
            bulkButtonsBarWidth = $bulkButtonsBar.outerWidth(),
            isAvailableTabInActive = this.$el.hasClass('jr-isInactive')

        doCalcOnVisibleNodeCloneObject({
            el: $bulkButtonsBar,
            css: {
                "left" : (0 - (bulkButtonsBarWidth * 2)) + "px",
                "width" : bulkButtonsBarWidth + "px"
            },
            classes: "jr " + (browserDetection.isIPad() ? "ipad" : ""), //add additional classes to parent container of cloned node
            alwaysClone: true,
            callback: function($clone) {
                _.each(BUTTON_TESTS, function(buttonTest) {
                    var widthOk = false;

                    _.each(buttonTest.strings, function(buttonString) {
                        if (widthOk) {
                            return;
                        }

                        var $button = $clone.find(buttonTest.selector),
                            $buttonText = $button.find(".jr-mItemselector-button-label span")
                                .text(buttonString),
                            btnRight = $button[0].getBoundingClientRect().right,
                            txtRight = $buttonText[0].getBoundingClientRect().right;

                        if (btnRight - txtRight >= 3 || buttonString === "" || isAvailableTabInActive) {
                            widthOk = true;
                            $bulkButtonsBar.find(buttonTest.selector + " .jr-mItemselector-button-label span")
                                .text(buttonString);
                        }
                    });
                });
            }
        });
    },

    changeValue: function() {
        this.trigger("selection:change", this.getValue());
    },

    changeDisabled: function() {
        var disabled = this.model.get("disabled");

        if (disabled) {
            this.$el.find("input[type='text']").attr("disabled", "disabled");
        } else {
            this.$el.find("input[type='text']").removeAttr("disabled");
        }

        this.listView.setDisabled(disabled);
    },

    onClickOnInput: function() {
        this.onFocus();
    },

    onFocus: function() {

        //Workaround for input's HTML5 placeholder attribute
        var input = this.$el.find("input");
        if (input.val() == input.attr('placeholder')) {
            input.val('');
            input.removeClass('jr-mMultiselect-input-placeholder');
        }
    },

    onBlur: function() {
        //Workaround for input's HTML5 placeholder attribute
        var input = this.$el.find("input");
        if (input.val() === '' || input.val() === input.attr('placeholder')) {
            input.addClass('jr-mMultiselect-input-placeholder');
            input.val(input.attr('placeholder'));
        }
        // End of workaround

        if (this.preventBlur) {
            return false;
        }
    },

    onMousedown: function() {
        if (!browserDetection.isIPad()) {
            this.preventBlur = true;
        }
    },

    onMouseup: function() {
        if (this.preventBlur) {
            delete this.preventBlur;

            this.$el.find("input.jr-mInput-search").focus();
        }
    },

    onGlobalMousedown: function(event) {
        if (this.preventBlur) {
            if (event.target !== this.el && this.$el.find(event.target).length === 0) {
                delete this.preventBlur;
                this.onBlur();
            }
        }
    },

    onGlobalMouseup: function() {
        this.onMouseup();
    },

    onGlobalMousemove: function(event) {
        if (this.preventBlur) {
            event.stopPropagation();
        }
    },

    onResize: function() {
        this.resize();
    },

    /* Key handlers for KeyboardManager */

    onUpKey: function(event) {
        var self = this;

        this._onUpDownNavigation(event, function() {
            self.listView.activatePrevious();
        }, function() {
            self.listView.activateLast();
        });
    },

    onDownKey: function(event) {
        var self = this;

        this._onUpDownNavigation(event, function() {
            self.listView.activateNext();
        }, function() {
            self.listView.activateFirst();
        });
    },

    _onUpDownNavigation: function(event, activateItem, resetToInitialActiveItem) {
        var nextActive,
            prevActive = this.listView.getActiveValue();

        if (prevActive) {
            if (event.shiftKey) {
                this.activeChangedWithShift = true;
            }

            activateItem();

            nextActive = this.listView.getActiveValue();

            if (nextActive.index === prevActive.index) {
                resetToInitialActiveItem();
            }
        } else {
            resetToInitialActiveItem();
        }
    },

    onEnterKey: function(event) {
        event.preventDefault();

        var active = this.listView.getActiveValue();
        if (!active) {
            return;
        }

        if (event.shiftKey) {
            this.listViewModel.addRangeToSelection(active.value, active.index);
        } else if (event.ctrlKey || event.metaKey) {
            this.listViewModel.clearSelection();
            this.listViewModel.addValueToSelection(active.value, active.index);
        } else {
            this.listViewModel.toggleSelection(active.value, active.index);
        }
    },

    onEscKey: function() {
        /* do nothing */
    },

    onHomeKey: function(event) {

        if (event.shiftKey) {
            this.activeChangedWithShift = true;
        }

        this.listView.activateFirst();
    },

    onEndKey: function(event) {

        if (event.shiftKey) {
            this.activeChangedWithShift = true;
        }

        this.listView.activateLast();
    },

    onPageUpKey: function(event) {

        if (event.shiftKey) {
            this.activeChangedWithShift = true;
        }

        this.listView.pageUp();
    },

    onPageDownKey: function(event) {

        if (event.shiftKey) {
            this.activeChangedWithShift = true;
        }

        this.listView.pageDown();
    },

    onTabKey: function() {
        /* do nothing */
    },

    onAKey: function(event) {
        if (!event.ctrlKey && !event.metaKey) {
            this.keyboardManager.deferredHandleKeyboardEvent(event);
        } else {
            event.stopPropagation();
            this.onSelectAll();
        }
    },

    /* Internal helper methods */

    processKeydown: function() {
        this.model.set("criteria", this.$el.find("input.jr-mInput-search").val());
    },

    changeFilter: function(callback) {
        var self = this,
            criteria = this.model.get("criteria");

        if (typeof criteria == "undefined" || criteria === "") {
            this.model.unset("totalValues", {silent: true});
        }

        this.listView.scrollTo(0);
        self.listView.activate(null, {silent: true}); //we have to drop active element before filter change

        this.getData({
            criteria: criteria,
            offset: 0,
            limit: this.listView.model.bufferSize
        }).done(function () {
            self.listViewModel.once("change", callback && typeof callback === "function" ? callback : function() {
                //need to set selected values again after change search criteria
                self.listView.setValue(_.keys(self.model.get("value")), {silent: true});
                self.listView.activate(0);
            });
            self.listView.fetch();
        });
    },

    clearFilter: function(callback) {
        if (this.model.get("criteria")) {
            this.$el.find("input").val("");
            this.model.set("criteria", "", {silent: true});

            this.changeFilter(callback);
        } else {
            this.model.unset("totalValues", {silent: true});
            callback && callback();
        }
    },

    processSelectionThroughApi: function(selection, options) {
        var newValues = {};

        this.selectionClear();

        for (let i = 0; i < selection.length; i += 1) {
            const value = selection[i];
            if (this.caseSensitiveSelection) {
                newValues[value] = true;
            } else {
                newValues[value.toLowerCase()] = value;
            }
        }

        this.model.attributes.value = newValues;
        if (!options || !options.silent) {
            this.model.trigger("change:value");
        }
    },

    convertSelectionForListViewModel: function(selection) {
        return selection;
    },

    /* Internal methods */

    getModelForRendering: function() {
        return {
            label: this.label,
            isIPad: browserDetection.isIPad(),
            disabled: this.model.get("disabled"),
            i18n: i18n
        }
    },

    /* API */

    fetch: function(callback, options) {
        var criteria = this.model.get("criteria");

        if (typeof criteria === "undefined" || criteria === "") {
            this.model.unset("totalValues", {silent: true});
        }

        this.listView.fetch(callback, options);
    },

    resize: function() {
        this.listView.resize();
        this.setBulkSelectionText();
    },

    reset: function(options) {
        var self = this;

        this.clearFilter(function() {
            self.listView.reset(options);
        });
    },

    getValue: function() {
        const currentValues = this.model.get("value");
        if (this.caseSensitiveSelection) {
            return Object.keys(currentValues);
        } else {
            return Object.values(currentValues);
        }
    },

    setValue: function(value, options) {
        options = options || {};

        this.listViewModel.once("selection:change", function () {
            this.selectionClear();
            const selection = this.listViewModel.getSelection();

            for (let i = 0; i < selection.length; i++) {
                const value = selection[i];
                if (this.caseSensitiveSelection) {
                    this.model.attributes.value[value] = true;
                } else {
                    this.model.attributes.value[value.toLowerCase()] = value;
                }
            }

            if (!options || !options.silent) {
                this.changeValue();
            }
        }, this);

        if (!_.isArray(value) && typeof value !== "string") {
            value = this.convertSelectionForListViewModel(value);
        }

        this.listViewModel.select(value, options.modelOptions);
    },

    setDisabled: function(disabled) {
        this.model.set("disabled", disabled);
    },

    getDisabled: function() {
        return this.model.get("disabled");
    },

    remove: function() {
        this.listView.remove();
        Backbone.View.prototype.remove.call(this);

        $("body").off("mousedown", this.onGlobalMousedown)
            .off("mouseup", this.onGlobalMouseup)
            .off("mousemove", this.onGlobalMousemove);

        $(window).off("resize", this._debouncedOnResize);
    }

});

export default AvailableItemsList;
