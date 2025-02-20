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
 * @version: $Id$
 */
import {Draggables, Draggable} from 'dragdropextra';
import {Template} from 'prototype';
import layoutModule from '../core/core.layout';
import buttonManager from '../core/core.events.bis';
import {
    isNotNullORUndefined,
    matchAny,
    deepClone,
    isArray,
    isShiftHeld,
    disableSelectionWithoutCursorStyle,
    cloneCustomAttributes,
    matchMeOrUp,
    isMetaHeld,
    isRightClick,
    isSupportsTouch,
    isIPad
} from '../util/utils.common';

import TouchController from '../util/touch.controller';
import {JSTooltip} from "./components.tooltip";
import _ from 'underscore';
import xssUtil from 'js-sdk/src/common/util/xssUtil';
import jQuery from 'jquery';
import stdnav from 'js-sdk/src/common/stdnav/stdnav';

var baseList = {
    isResponsive: function (item) {
        return jQuery(item).parent().hasClass(layoutModule.RESPONSIVE_CLASS);
    },
    isCollapsible: function (item) {
        return jQuery(item).parent().hasClass(layoutModule.COLLAPSIBLE_CLASS);
    },
    selectItem: function (item) {
        if (this._allowSelections) {
            if (this.isItemDisabled(item)) {
                return;
            }
            jQuery(item).addClass(layoutModule.SELECTED_CLASS);
        }
    },
    deselectItem: function (item) {
        jQuery(item).removeClass(layoutModule.SELECTED_CLASS);
    },
    isItemSelected: function (item) {
        return jQuery(item).hasClass(layoutModule.SELECTED_CLASS);
    },
    disableItem: function (item) {
        buttonManager.disable(item);
    },
    enableItem: function (item) {
        buttonManager.enable(item);
    },
    isItemDisabled: function (item) {
        return buttonManager.isDisabled(item);
    },
    openItem: function (item) {
        jQuery(item).removeClass(layoutModule.CLOSED_CLASS).addClass(layoutModule.OPEN_CLASS)[0].isOpen = true;
    },
    isItemOpen: function (item) {
        return jQuery(item).hasClass(layoutModule.OPEN_CLASS) || jQuery(item)[0].isOpen && !jQuery(item).hasClass(layoutModule.CLOSED_CLASS);
    },
    closeItem: function (item) {
        jQuery(item).removeClass(layoutModule.OPEN_CLASS).addClass(layoutModule.CLOSED_CLASS)[0].isOpen = false;
    }
};    ///////////////////////////////////////////////////////
// Global module for all list related code
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
// Global module for all list related code
///////////////////////////////////////////////////////
var dynamicList = {
    /**
     * Map of all created lists on current page
     */
    lists: {},
    /**
     * Id of last active list
     */
    activeListId: null,
    _templateHash: {},
    messages: { 'listNItemsSelected': '#{count} items selected' },
    /**
     * @return {dynamicList}
     */
    getDynamicListForElement: function (element) {
        var $list = jQuery(element)[0];
        if (!jQuery($list).is('ul,ol')) {
            $list = jQuery($list).parent('ul,ol');
            if ($list.length === 0) {
                return null;
            }
        }
        return dynamicList.lists[$list.id];
    }
};    ///////////////////////////////////////////////////////
// ListItem
///////////////////////////////////////////////////////
/**
 * Respond on events: dblclick, click, mouseover, mousedown, mouseup, key:down and key:up
 * Options:
 *      respondOnItemEvents - when false all event will be ignored
 *      excludeFromEventHandling - [selectorPattern1, selectorPattern2]
 *      excludeFromSelectionTriggers - []
 *
 * @param options
 */
///////////////////////////////////////////////////////
// ListItem
///////////////////////////////////////////////////////
/**
 * Respond on events: dblclick, click, mouseover, mousedown, mouseup, key:down and key:up
 * Options:
 *      respondOnItemEvents - when false all event will be ignored
 *      excludeFromEventHandling - [selectorPattern1, selectorPattern2]
 *      excludeFromSelectionTriggers - []
 *
 * @param options
 */
dynamicList.ListItem = function (options) {
    this._itemId = undefined;
    this._list = undefined;
    this.first = false;
    this.last = false;
    if (options) {
        this.isIconClicked = true;
        this._value = options.value ? options.value : {};
        this._label = options.label ? options.label : '';
        this._subList = options.subList;
        this._cssClassName = 'cssClassName' in options ? options.cssClassName : undefined;
        this._templateDomId = 'templateDomId' in options ? options.templateDomId : undefined;
        this._respondOnItemEvents = !Object.isUndefined(options.respondOnItemEvents) ? options.respondOnItemEvents : true;
        this._excludeFromEventHandling = 'excludeFromEventHandling' in options ? options.excludeFromEventHandling : undefined;
        this._excludeFromSelectionTriggers = 'excludeFromSelectionTriggers' in options ? options.excludeFromSelectionTriggers : undefined;
        this.FAVORITE_ICON_PATTERN= options.favoriteIconPattern ;
        this.SCHEDULE_ICON_PATTERN= options.scheduleIconPattern ;

    }
};    /**
 *
 */
/**
 *
 */
dynamicList.ListItem.addVar('DEFAULT_TEMPLATE_DOM_ID', 'dynamicListItemTemplate');
dynamicList.ListItem.addVar('DEFAULT_ITEM_ID_PREFIX', 'item');
dynamicList.ListItem.addVar('DEFAULT_SUB_LIST_ID_SUFFIX', 'SubList');    ///////////////////////////////////////////////////////
// Public ListItem methods
///////////////////////////////////////////////////////
/**
 * Gets ID of the item, which is being generated by the list.
 * @return {Number} ID of the item
 */
///////////////////////////////////////////////////////
// Public ListItem methods
///////////////////////////////////////////////////////
/**
 * Gets ID of the item, which is being generated by the list.
 * @return {Number} ID of the item
 */
dynamicList.ListItem.addMethod('getId', function () {
    return this._itemId;
});    /*
 * Sets the list and generates new id in that list.
 * This method is used by the list to set reference on itself.
 *
 * @param list {{@see dynamicList.List}}
 */
/*
 * Sets the list and generates new id in that list.
 * This method is used by the list to set reference on itself.
 *
 * @param list {{@see dynamicList.List}}
 */
dynamicList.ListItem.addMethod('setList', function (list) {
    this._list = list;
    // This function should no longer be used for this purpose.
    // Use "unsetList" instead.
    // FIXME: Turn this on when logging is added to this module!
    // this.logger.warn("deprecated use case");
    if (this.getList()) {
        this._itemId = this.getList().getNextItemId();
    }
});    /*
 * Explicitly clears the item's link to its previous list.
 * Use this function instead of setList(null) or setList(undefined).
 *
 * @param list {{@see dynamicList.List}}
 */
/*
 * Explicitly clears the item's link to its previous list.
 * Use this function instead of setList(null) or setList(undefined).
 *
 * @param list {{@see dynamicList.List}}
 */
dynamicList.ListItem.addMethod('unsetList', function () {
    this._list = null;    // listItem IDs depend on their assigned list.
    // listItem IDs depend on their assigned list.
    this._itemId = undefined;
});    /*
 * Gets the list where this item is listed.
 *
 * @return {{@see dynamicList.List}}
 */
/*
 * Gets the list where this item is listed.
 *
 * @return {{@see dynamicList.List}}
 */
dynamicList.ListItem.addMethod('getList', function () {
    return this._list;
});    /**
 * Sets value of the item.
 *
 * @param {String}
 */
/**
 * Sets value of the item.
 *
 * @param {String}
 */
dynamicList.ListItem.addMethod('setValue', function (value) {
    return this._value = value;
});    /**
 * Gets value of the item.
 *
 * @return {String}
 */
/**
 * Gets value of the item.
 *
 * @return {String}
 */
dynamicList.ListItem.addMethod('getValue', function () {
    return this._value;
});    /**
 * Sets label defined by user.
 *
 * @param {Object}
 */
/**
 * Sets label defined by user.
 *
 * @param {Object}
 */
dynamicList.ListItem.addMethod('setLabel', function (label) {
    return this._label = label;
});    /**
 * Gets label of the item defined by user.
 *
 * @return {Object}
 */
/**
 * Gets label of the item defined by user.
 *
 * @return {Object}
 */
dynamicList.ListItem.addMethod('getLabel', function () {
    return this._label;
});    /**
 * Setter and getter for the style of the item.
 * Changes of the style will be applied after call of method {@see dynamicList.ListItem#refresh}
 */
/**
 * Setter and getter for the style of the item.
 * Changes of the style will be applied after call of method {@see dynamicList.ListItem#refresh}
 */
dynamicList.ListItem.addMethod('setCssClassName', function (cssClassName) {
    this._cssClassName = cssClassName;
}).addMethod('getCssClassName', function () {
    return this._cssClassName;
});    /**
 * Sets the ID of DOM element which will be used for rendering of mark up.
 * Changes of the style will be applied after call of method {@see dynamicList.ListItem#refresh}
 *
 * @param templateDomId {String}
 */
/**
 * Sets the ID of DOM element which will be used for rendering of mark up.
 * Changes of the style will be applied after call of method {@see dynamicList.ListItem#refresh}
 *
 * @param templateDomId {String}
 */
dynamicList.ListItem.addMethod('setTemplateDomId', function (templateDomId) {
    this._templateDomId = templateDomId;
});    /**
 * Gets the ID of the current template of the item.
 *                                  Attr
 * @return {String}
 */
/**
 * Gets the ID of the current template of the item.
 *                                  Attr
 * @return {String}
 */
dynamicList.ListItem.addMethod('getTemplateDomId', function () {
    return this._templateDomId;
});    /**
 * Render the item specified container.
 * Use this method when you need re-render item.
 *
 * @param container {DOMElement}
 */
/**
 * Render the item specified container.
 * Use this method when you need re-render item.
 *
 * @param container {DOMElement}
 */
dynamicList.ListItem.addMethod('show', function (container) {
    if (!container) {
        return;
    }
    this._element = this.processTemplate(this._getTemplate());
    this._getElement().setAttribute('id', this._generateId());
    this._getElement().setAttribute('tabindex', -1);
    this.first && this.getList().tabindex && jQuery(this._getElement()).attr('tabindex', this.getList().tabindex);
    this.first && this.getValue().isLabel && jQuery('#'+this.getList().getId()).attr('aria-label', this.getLabel().split(':')[0]);
    this._getElement().listItem = this;
    this.refreshStyle();
    let siblings = container.childElements();
    let itemIndex = this.index();
    let afterIndex = itemIndex - 1;

    if(jQuery(this._element.children).attr('role') === 'row'){
        jQuery(this._element).children('[role="row"]').attr('aria-posinset',this.getId());
        jQuery(this._element).children('[role="row"]').attr('aria-level',1);
        jQuery(this._element).children('[role="row"]').attr('aria-setsize',-1);
    }
    if(this._list.isCompositeSubList){
        let posinset = parseInt(jQuery(this._element).children('[role="row"]').attr('aria-posinset'));
        jQuery(this._element).children('[role="row"]').attr('aria-level',posinset+1)
        jQuery(this._element).children('[role="row"]').attr('aria-setsize',-1);
    }

    afterIndex > -1 && afterIndex < siblings.length ? this._getElement().insert({ after: siblings[afterIndex] }) : jQuery(container)[0].insert(this._getElement());
});    /**
 *
 */
/**
 *
 */
dynamicList.ListItem.addMethod('refresh', function () {
    var hadFocus = false;    // NOTE: _getElement is not just a simple accessor, and apparently has
    // side-effects which are required elsewhere.
    // NOTE: _getElement is not just a simple accessor, and apparently has
    // side-effects which are required elsewhere.
    if (!this._getElement()) {
        return;
    }
    if (this.getList()) {
        if (document.activeElement === this._getElement()) {
            hadFocus = true;
        }
        this._element = this.processTemplate(this._getElement());
        this.refreshStyle();
        if (hadFocus) {
            jQuery(this._getElement()).focus();
        }
    } else {
        this._getElement().remove();
        this._element = null;
    }
});    /**
 *
 */
/**
 *
 */
dynamicList.ListItem.addMethod('refreshStyle', function () {
    var element = this._getElement();    // List may not have been rendered yet.
    // List may not have been rendered yet.
    if (!element) {
        return;
    }
    if (element.templateClassName) {
        element.className = element.templateClassName;
    }
    if (this.first) {
        jQuery(element).addClass(layoutModule.FIRST_CLASS);
    }
    if (this.last) {
        jQuery(element).addClass(layoutModule.LAST_CLASS);
    }
    if (this.isSelected()) {
        jQuery(element).addClass(layoutModule.SELECTED_CLASS);
    }
    if (this.isDisabled()) {
        jQuery(element).addClass(layoutModule.DISABLED_CLASS);
    }
    if (this.getCssClassName()) {
        jQuery(element).addClass(this.getCssClassName());
    }    // Update cursor styles.  Note that cursor logic for composite items will
    // be done after this call.
    // Update cursor styles.  Note that cursor logic for composite items will
    // be done after this call.
    if (!this.isComposite) {
        if (this === this.getList().cursor) {
            jQuery(element).addClass('cursor');
        }
    }
});    /**
 *
 */
/**
 *
 */
dynamicList.ListItem.addMethod('isRendered', function () {
    return isNotNullORUndefined(this._getElement());
});    /**
 *
 */
/**
 *
 */
dynamicList.ListItem.addMethod('disable', function () {
    baseList.disableItem(this._getElement());
}).addMethod('enable', function () {
    baseList.enableItem(this._getElement());
}).addMethod('isDisabled', function () {
    return baseList.isItemDisabled(this._getElement());
});    /**
 * Prepare mark up template of the item before render or process existing mark up when refresh the item.
 * If template was changed method should be overridden.
 *
 * @param {DOMElement} - current item element
 * @return {DOMElement} - element ready for use
 */
/**
 * Prepare mark up template of the item before render or process existing mark up when refresh the item.
 * If template was changed method should be overridden.
 *
 * @param {DOMElement} - current item element
 * @return {DOMElement} - element ready for use
 */
dynamicList.ListItem.addMethod('processTemplate', function (element) {
    var wrapper = element.childElements()[0];
    wrapper.cleanWhitespace();
    var elementsCount = wrapper.childElements().length;
    if (elementsCount == wrapper.childNodes.length) {
        wrapper.insert(xssUtil.hardEscape(this.getLabel()));
    } else {
        wrapper.childNodes[elementsCount].data = this.getLabel();
    }    //  $(wrapper.parentNode).writeAttribute("tabIndex",-1);
    //  $(wrapper.parentNode).writeAttribute("tabIndex",-1);
    return element;
});    /**
 * focus on this node's element
 */
/**
 * focus on this node's element
 */
dynamicList.ListItem.addMethod('focus', function () {
    this._getElement().focus();
});    /**
 * Removes it self from the list.
 */
/**
 * Removes it self from the list.
 */
dynamicList.ListItem.addMethod('remove', function () {
    this.getList().removeItems([this]);
});    /**
 *
 */
/**
 *
 */
dynamicList.ListItem.addMethod('isSelected', function () {
    return this.getList().isItemSelected(this);
});    /**
 *
 */
/**
 *
 */
dynamicList.ListItem.addMethod('select', function () {
    this.getList().selectItem(this, true);
});    /**
 *
 */
/**
 *
 */
dynamicList.ListItem.addMethod('deselect', function () {
    this.getList().deselectItem(this);
});
dynamicList.ListItem.addMethod('index', function () {
    this.getList().getItems().indexOf(this);
});    ///////////////////////////////////////////////////////
// Private ListItem methods
///////////////////////////////////////////////////////
/**
 * Gets or looking for DOM element of this item.
 *
 * @return {DOMElement}
 */
///////////////////////////////////////////////////////
// Private ListItem methods
///////////////////////////////////////////////////////
/**
 * Gets or looking for DOM element of this item.
 *
 * @return {DOMElement}
 */
dynamicList.ListItem.addMethod('_getElement', function () {
    if (!this._element) {
        var e = jQuery('#' + this._generateId())[0];
        this._element = Object.isElement(e) ? e : undefined;
    }
    return this._element;
});
dynamicList.ListItem.addMethod('_getTemplate', function () {
    var id = this._templateDomId;
    if (!dynamicList._templateHash[id]) {
        dynamicList._templateHash[id] = id;
    }
    var clone = document.getElementById(dynamicList._templateHash[id]).clone(true);
    clone.templateId = id;
    clone.templateClassName = clone.className;
    return clone;
});
dynamicList.ListItem.addMethod('_generateId', function () {
    // There are some weird situations where this can get called due to a
    // refresh while deleting an item.  In these situations, the item may no
    // longer be assigned to a list.  In this case, this function returns
    // null.
    if (!this.getList() || !this.getList().getId()) {
        return null;
    }
    return this.getList().getId() + '_' + this.DEFAULT_ITEM_ID_PREFIX + this.getId();
});
dynamicList.ListItem.addMethod('_isElementInExcluded', function (event, item) {
    var element = event.element();
    return this._excludeFromEventHandling && matchAny(element, this._excludeFromEventHandling) != null;
});
dynamicList.ListItem.addMethod('_isExcludedFromSelectionTriggers', function (event) {
    var element = event.target;
    return this._excludeFromSelectionTriggers && matchAny(element, this._excludeFromSelectionTriggers) != null;
});
dynamicList.ListItem.addMethod('_isFavoriteHandler', function (element) {
    return jQuery(element).is(this.FAVORITE_ICON_PATTERN);
});
dynamicList.ListItem.addMethod('_isScheduleHandler', function (element) {
    return jQuery(element).is(this.SCHEDULE_ICON_PATTERN);
})///////////////////////////////////////////////////////
// Composite List Item
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
// Composite List Item
///////////////////////////////////////////////////////
dynamicList.CompositeItem = function (options) {
    dynamicList.ListItem.call(this, options);
    this.isComposite = true;
    this._items = options.items;
    this._openUp = options.openUp;
    this._subList = null;
    this._subListOptions = options.listOptions ? options.listOptions : {};
    this._listTagName = 'ul';
    this.FAVORITE_ICON_PATTERN = options.favoriteIconPattern ;
    this.SCHEDULE_ICON_PATTERN = options.scheduleIconPattern;
    this.OPEN_HANDLER_PATTERN = options.openHandlerPattern ? options.openHandlerPattern : this.OPEN_HANDLER_PATTERN;
    this.CLOSE_HANDLER_PATTERN = options.closeHandlerPattern ? options.closeHandlerPattern : this.CLOSE_HANDLER_PATTERN;
};
dynamicList.CompositeItem.prototype = deepClone(dynamicList.ListItem.prototype);
dynamicList.CompositeItem.addVar('OPEN_HANDLER_PATTERN', '[openHandler=openHandler]');
dynamicList.CompositeItem.addVar('CLOSE_HANDLER_PATTERN', '[closeHandler=closeHandler]');
dynamicList.CompositeItem.addMethod('getItems', function () {
    return this._items;
});
dynamicList.CompositeItem.addMethod('setItems', function (items) {
    this._items = items;
});
dynamicList.CompositeItem.addMethod('addItem', function (item) {
    this._items.push(item);
});
dynamicList.CompositeItem.addMethod('removeItems', function (items) {
    this._items = this._items.reject(function (item) {
        return items.include(item);
    });
    this._subList.removeItems(items);
});
dynamicList.CompositeItem.addMethod('show', function (container) {
    this._listTagName = container.tagName;
    dynamicList.ListItem.prototype.show.call(this, container);
    baseList.closeItem(this._getElement());
    if (!this._items) {
        return;
    }
    this._showSubList();
});
dynamicList.CompositeItem.addMethod('_showSubList', function () {
    var id = this._getSubListId();
    var subListElement = new Element(this._listTagName, { id: id });
    this._getElement().insert(this._openUp ? { top: subListElement } : { bottom: subListElement });
    var opts = this._subListOptions;
    this._subList = new dynamicList.List(id, {
        allowSelections: 'allowSelections' in opts ? opts.allowSelections : this.getList()._allowSelections,
        responsive: 'responsive' in opts ? opts.responsive : this.getList()._responsive,
        selectionDefaultsToCursor: 'selectionDefaultsToCursor' in opts ? opts.selectionDefaultsToCursor : this.getList()._selectionDefaultsToCursor,
        collapsible: 'collapsible' in opts ? opts.collapsible : this.getList()._collapsible,
        multiSelect: 'multiSelect' in opts ? opts.multiSelect : this.getList()._multiSelect,
        cssClassName: 'cssClassName' in opts ? opts.cssClassName : this.getList()._cssClassName,
        listTemplateDomId: 'listTemplateDomId' in opts ? opts.listTemplateDomId : this.getList()._listTemplateDomId,
        itemTemplateDomId: 'itemTemplateDomId' in opts ? opts.itemTemplateDomId : this.getList()._itemTemplateDomId,
        itemCssClassName: 'itemCssClassName' in opts ? opts.itemCssClassName : this.getList()._itemCssClassName,
        comparator: 'comparator' in opts ? opts.comparator : this.getList()._comparator,
        items: this._items,
        isCompositeSubList: true

    });
    this._subList._initEvents = function () {
    };
    this._subList.show();
    this._subList._parentList = this.getList();
    this._subList.getItems().each(function (item) {
        item.parentItem = this;
    }.bind(this));
});
dynamicList.CompositeItem.addMethod('refresh', function () {
    dynamicList.ListItem.prototype.refresh.call(this);
    if (!this._items) {
        return;
    }
    if (this._subList) {
        this._subList.refresh();
    } else {
        this._showSubList();
    }
});
dynamicList.CompositeItem.addMethod('getFirstChild', function () {
    if (this._subList.getItems().length < 1) {
        // No children, OR, children still loading.
        return null;
    }
    return this._subList.getItems()[0];
});
dynamicList.CompositeItem.addMethod('refreshStyle', function () {
    dynamicList.ListItem.prototype.refreshStyle.call(this);
    if (!this._getElement()) {
        // List has not been rendered yet.
        return;
    }
    if (baseList.isItemOpen(this._getElement())) {
        baseList.openItem(this._getElement());
        if (this === this.getList().cursor) {
            if (this._subList && this._subList.cursor) {
                // Sublist is open, and an item is an active cursor.
                jQuery(this._getElement()).addClass('supercursor');
            } else {
                // Sublist is open, but has no active cursor.
                jQuery(this._getElement()).addClass('cursor');
            }
        }
    } else {
        baseList.closeItem(this._getElement());
        if (this === this.getList().cursor) {
            jQuery(this._getElement()).addClass('cursor');
        }
    }
    if (!this._subList) {
        return;
    }
    this._subList.refreshStyle();
});
dynamicList.CompositeItem.addMethod('_isOpenHandler', function (element) {
    return jQuery(element).is(this.OPEN_HANDLER_PATTERN);
}).addMethod('_isCloseHandler', function (element) {
    return jQuery(element).is(this.CLOSE_HANDLER_PATTERN);
}).addMethod('_isFavoriteHandler', function (element) {
    return jQuery(element).is(this.FAVORITE_ICON_PATTERN);
}).addMethod('_isScheduleHandler', function (element) {
    return jQuery(element).is(this.SCHEDULE_ICON_PATTERN);
});
dynamicList.CompositeItem.addMethod('_getSubListId', function () {
    return this._generateId() + '_' + this.DEFAULT_SUB_LIST_ID_SUFFIX;
});    ///////////////////////////////////////////////////////
// Templated list item - uses Mustache to process item content as a template. Takes fields of item.getValue() to fill the template
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
// Templated list item - uses Mustache to process item content as a template. Takes fields of item.getValue() to fill the template
///////////////////////////////////////////////////////
dynamicList.TemplatedListItem = function (options) {
    if (options) {
        this.tooltipText = 'tooltipText' in options ? options.tooltipText : null;
    }
    dynamicList.ListItem.call(this, options);
};
var tempFunc = function () {
};
tempFunc.prototype = dynamicList.ListItem.prototype;
dynamicList.TemplatedListItem.prototype = new tempFunc();
dynamicList.TemplatedListItem.prototype.constructor = dynamicList.TemplatedListItem;
dynamicList.TemplatedListItem.prototype.processTemplate = function (element) {};
// List element that is rendered from Underscore template string passed as an option
dynamicList.UnderscoreTemplatedListItem = function (options) {
    dynamicList.TemplatedListItem.call(this, options);
    if (options) {
        this._template = 'template' in options ? options.template : '';
    }
};
var tempFunction = function () {
};
tempFunction.prototype = dynamicList.TemplatedListItem.prototype;
dynamicList.UnderscoreTemplatedListItem.prototype = new tempFunction();
dynamicList.UnderscoreTemplatedListItem.prototype.constructor = dynamicList.UnderscoreTemplatedListItem;
dynamicList.UnderscoreTemplatedListItem.prototype._getTemplate = function () {
    return this._template;
};
dynamicList.UnderscoreTemplatedListItem.prototype.processTemplate = function () {
    var element = jQuery(_.template(this._template, xssUtil.hardEscape(this.getValue())))[0];
    element.templateClassName = element.className;
    if (this.tooltipText != null) {
        new JSTooltip(element, { text: xssUtil.hardEscape(this.tooltipText) });
    }
    return element;
};    ///////////////////////////////////////////////////////
// List Component
///////////////////////////////////////////////////////
/*
 * Dynamically creates items on specified UL element. Supports sorting and ...
 *
 * @param id {String} - ID of the UL element, this id will be used as ID of the list.
 * @param options {JSON Object}
 * <ul>
 * <li>items {Array} - array of {@link dynamicList.ListItem}, which need be shown when object is created</li>
 * </ul>
 */
///////////////////////////////////////////////////////
// List Component
///////////////////////////////////////////////////////
/*
 * Dynamically creates items on specified UL element. Supports sorting and ...
 *
 * @param id {String} - ID of the UL element, this id will be used as ID of the list.
 * @param options {JSON Object}
 * <ul>
 * <li>items {Array} - array of {@link dynamicList.ListItem}, which need be shown when object is created</li>
 * </ul>
 */
dynamicList.List = function (id, options) {
    this._id = id;
    this._items = [];
    this._selectedItems = [];
    this._lastSelectedItem = null;
    this.cursor = null;
    this._nextId = 1;    // private static var
    // private static var
    this.draggables = [];
    this._parentList = null;
    this.listOrientation = null;
    if (options) {
        // Options with defaults.
        this._selectionDefaultsToCursor = 'selectionDefaultsToCursor' in options ? options.selectionDefaultsToCursor : true;
        this._allowSelections = 'allowSelections' in options ? options.allowSelections : true;
        this._cssClassName = 'cssClassName' in options ? options.cssClassName : '';
        this._excludeFromEventHandling = 'excludeFromEventHandling' in options ? options.excludeFromEventHandling : false;
        this._excludeFromSelectionTriggers = 'excludeFromSelectionTriggers' in options ? options.excludeFromSelectionTriggers : false;
        this._multiSelect = 'multiSelect' in options ? options.multiSelect : false;
        this._selectOnMousedown = 'selectOnMousedown' in options ? options.selectOnMousedown : true;
        this._setCursorOnMousedown = 'setCursorOnMousedown' in options ? options.setCursorOnMousedown : true;    // Options with no default other than "undefined".
        // Options with no default other than "undefined".
        this._listTemplateDomId = options.listTemplateDomId;
        this._itemTemplateDomId = options.itemTemplateDomId;
        this._itemCssClassName = options.itemCssClassName;
        this._comparator = options.comparator;
        this.listOrientation = options.listOrientation;
        this.dragPattern = options.dragPattern;
        this.scroll = options.scroll;    // An initial set of items may be passed in with the options hash.
        // An initial set of items may be passed in with the options hash.
        this.isCompositeSubList= options.isCompositeSubList;
        this.setItems(options.items);
    }
    this._createFromTemplate();
    this._registerCustomScroll();
    dynamicList.activeListId = this.getId();
    this._msgNItemsSelected = new Template(dynamicList.messages['listNItemsSelected']);
    dynamicList.lists[this._id] = this;
};
dynamicList.List.addVar('Event', {
    ITEM_SELECTED: 'item:selected',
    ITEM_UNSELECTED: 'item:unselected',
    ITEM_MOUSEUP: 'item:mouseup',
    ITEM_MOUSEDOWN: 'item:mousedown',
    ITEM_CLICK: 'item:click',
    ITEM_DBLCLICK: 'item:dblclick',
    ITEM_OPEN: 'item:open',
    ITEM_CLOSED: 'item:closed',
    ITEM_CONTEXTMENU: 'item:contextmenu',
    ITEM_BEFORE_SELECT_OR_UNSELECT: 'item:beforeSelectOrUnselect'
});
dynamicList.List.addVar('DND_WRAPPER_TEMPLATE', 'column_two');
dynamicList.List.addVar('DND_ITEM_TEMPLATE', 'column_two:resourceName');    ///////////////////////////////////////////////////////
// List public methods
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
// List public methods
///////////////////////////////////////////////////////
dynamicList.List.addMethod('getNextItemId', function () {
    return this._nextId++;
});    /**
 * Gets ID of the list which can be used to find this list in map {@see dynamicList.lists}
 *
 * @return {String} - ID for the list and DOM element
 */
/**
 * Gets ID of the list which can be used to find this list in map {@see dynamicList.lists}
 *
 * @return {String} - ID for the list and DOM element
 */
dynamicList.List.addMethod('getId', function () {
    return this._id;
});    /**
 * @return {Array}
 */
/**
 * @return {Array}
 */
dynamicList.List.addMethod('getItems', function () {
    return this._items;
});    /**
 * Resets list items with new items and sorts items, if comparator is defined.
 * @param items {Array} - new array of {@link dynamicList.ListItem}
 */
/**
 * Resets list items with new items and sorts items, if comparator is defined.
 * @param items {Array} - new array of {@link dynamicList.ListItem}
 */
dynamicList.List.addMethod('setItems', function (items) {
    if (!items) {
        return;
    }    // If the list had a cursor, a new cursor will need to be assigned.
    // Likewise, if focus is lost, focus will need to be reassigned to prevent
    // missing blur events when elements are dropped.
    // NOTE: Do NOT use getCursor here, as it will attempt to assign a cursor
    // if none exists, which in turn may add the cursor to the selection set,
    // depending on list options.  THAT, in turn, could fire user callbacks
    // that appear to run on items that are about to be replaced.  That could
    // (and did) cause Filter problems on the Search Results page.
    // If the list had a cursor, a new cursor will need to be assigned.
    // Likewise, if focus is lost, focus will need to be reassigned to prevent
    // missing blur events when elements are dropped.
    // NOTE: Do NOT use getCursor here, as it will attempt to assign a cursor
    // if none exists, which in turn may add the cursor to the selection set,
    // depending on list options.  THAT, in turn, could fire user callbacks
    // that appear to run on items that are about to be replaced.  That could
    // (and did) cause Filter problems on the Search Results page.
    var oldCursor = this.cursor;
    var listEl = this._getElement();
    var hadFocus = false;
    if (listEl && (listEl === document.activeElement || jQuery.contains(listEl, document.activeElement))) {
        hadFocus = true;
    }
    this._items = [];
    this.resetSelected();
    this.addItems(items);
    var newCursor;
    if (oldCursor) {
        // A new cursor will be assigned, if any items exist.
        newCursor = this.getCursor();
    }
    if (hadFocus) {
        if (newCursor && newCursor._getElement()) {
            // NOTE: StdNav plugin for dynamicList will auto-promote focus when
            // available (accessibility extensions are on) and possible (items
            // exist), but this is more efficient.
            jQuery(newCursor._getElement()).focus();
        } else if (listEl) {
            // No items, no suitable cursor, or cursor has not been rendered
            // yet-- focus the list itself.
            jQuery(listEl).focus();
        }  // FIXME: Enable when logger is added
        // this.logger.error("Focus has been abandoned; region tabindex may be lost");
        //console.error("Focus has been abandoned; region tabindex may be lost");
    }
});    /**
 * Adds items to array items of list and sorts it, if comparator is defined.
 * @param items {Array} - array of {@link dynamicList.ListItem}
 */
/**
 * Adds items to array items of list and sorts it, if comparator is defined.
 * @param items {Array} - array of {@link dynamicList.ListItem}
 */
dynamicList.List.addMethod('addItems', function (items) {
    if (!items) {
        return;
    }
    items = _.isArray(items) ? items : [items];
    items.compact().each(function (item) {
        this._prepareListItem(item);
        this._items.push(item);
    }.bind(this));
    if (this._comparator) {
        this._items = this._items.sort(this._comparator);
    }
});    /**
 * Inserts items to appropriate position in array items of list.
 *
 * WARNING: Using this function with sortable lists may cause unexpected results
 *
 * @param pos {int} - position of element after which new items will be inserted.
 * @param items {Array} - array of {@link dynamicList.ListItem}
 */
/**
 * Inserts items to appropriate position in array items of list.
 *
 * WARNING: Using this function with sortable lists may cause unexpected results
 *
 * @param pos {int} - position of element after which new items will be inserted.
 * @param items {Array} - array of {@link dynamicList.ListItem}
 */
dynamicList.List.addMethod('insertItems', function (pos, items) {
    if (!items) {
        return;
    }
    items = _.isArray(items) ? items : [items];
    items = items.compact();
    items.each(function (item) {
        this._prepareListItem(item);
    }.bind(this));
    this._items.splice.apply(this._items, [
        pos,
        0
    ].concat(items));
    if (this._comparator) {
        this._items = this._items.sort(this._comparator);
    }
});    /**
 * Prepare List Item for adding to list. Set List reference, template DOM ID and css class name.
 */
/**
 * Prepare List Item for adding to list. Set List reference, template DOM ID and css class name.
 */
dynamicList.List.addMethod('_prepareListItem', function (item) {
    if (!item) {
        return;
    }
    item.setList(this);
    if (this._itemTemplateDomId && !item.getTemplateDomId()) {
        // If list has specified template for all items and there is no other template
        item.setTemplateDomId(this._itemTemplateDomId);
    }
    if (this._itemCssClassName && !item.getCssClassName()) {
        // If list has specified CSS class for all items and the item don't has CSS class
        item.setCssClassName(this._itemCssClassName);
    }
    if (this._excludeFromEventHandling && !item._excludeFromEventHandling) {
        item._excludeFromEventHandling = this._excludeFromEventHandling;
    }
    if (this._excludeFromSelectionTriggers && !item._excludeFromSelectionTriggers) {
        item._excludeFromSelectionTriggers = this._excludeFromSelectionTriggers;
    }
});    /**
 * Removes specified items from list
 * @param items {Array} - array of {@link dynamicList.ListItem}
 */
/**
 * Removes specified items from list
 * @param items {Array} - array of {@link dynamicList.ListItem}
 */
dynamicList.List.addMethod('removeItems', function (items) {
    if (!items || !isArray(items)) {
        return;
    }    // The current cursor and/or browser focus may be lost as a result of this
    // operation.  Deleting the current focus does NOT fire blur events!
    // Therefore it is critical to MOVE focus prior to deleting the element, if
    // it is focused.
    // The current cursor and/or browser focus may be lost as a result of this
    // operation.  Deleting the current focus does NOT fire blur events!
    // Therefore it is critical to MOVE focus prior to deleting the element, if
    // it is focused.
    var newCursor = this.getCursor();
    var lostFocus = false;    // Deselect items PRIOR to removal.
    // Deselect items PRIOR to removal.
    items.each(function (item) {
        // Note that _removeItemFromSelected is used instead of deselectItem to
        // avoid changing the cursor prematurely.  This avoids callers reacting
        // to selection/deselection events (which occur as a result of the cursor
        // change on lists with alwaysSelectCursor style) on items that do not
        // exist by the time they attempt to handle those events.
        this._removeItemFromSelected(item);
        if (newCursor === item) {
            // If we are removing the cursor (or the prospective new cursor),
            // ensure a new cursor is assigned.
            newCursor = this.getNextItem(item);
            if (!newCursor) {
                newCursor = this.getPreviousItem(item);
            }
        }
    }.bind(this));
    this._items = this._items.reject(function (item) {
        return items.include(item);
    });
    items.each(function (item) {
        // Sanity check; remove when tested.
        if (newCursor === item) {
        }    // FIXME: Turn this on once the logger is in use.
        // logger.error("Focus has been abandoned");
        //console.error("Focus has been abandoned");
        item.unsetList();
        item.refresh();
    });    // Update the cursor, if needed.  Note that lists with NO cursor should
    // continue to have no cursor.
    // Update the cursor, if needed.  Note that lists with NO cursor should
    // continue to have no cursor.
    if (newCursor !== this.getCursor()) {
        this.setCursor(newCursor);
    }    // If focus has been lost, focus the new cursor.
    // If focus has been lost, focus the new cursor.
    if (lostFocus) {
        if (this.getCursor() && this.getCursor()._getElement()) {
            jQuery(this.getCursor()._getElement().focus());
        } else if (this._getElement()) {
            // No cursor, or cursor has not been rendered yet.
            // Set focus to the list, if possible.
            jQuery(this._getElement().focus());
        }
    }
});    /**
 * @param comparator {Function} -
 */
/**
 * @param comparator {Function} -
 */
dynamicList.List.addMethod('sort', function (comparator) {
    comparator && (this._comparator = comparator);
    if (this._comparator) {
        this.getItems().sort(this._comparator);
    }
});    /** Note that it is not possible to set the cursor to null to remove it.  All
 *  lists have cursors, and those cursors need to be set.  You may not think
 *  you need one, but you do-- this is how visually-disabled users read through
 *  your list entries.
 *
 *  If you really want to disable a visual cursor indication for a particular
 *  list, use an ID-based CSS style rule to do so.  If the user tabs into the
 *  list, they will still be able to navigate using the arrow keys, and will
 *  see the usual :focus and .subfocus visual cues when doing so.
 */
/** Note that it is not possible to set the cursor to null to remove it.  All
 *  lists have cursors, and those cursors need to be set.  You may not think
 *  you need one, but you do-- this is how visually-disabled users read through
 *  your list entries.
 *
 *  If you really want to disable a visual cursor indication for a particular
 *  list, use an ID-based CSS style rule to do so.  If the user tabs into the
 *  list, they will still be able to navigate using the arrow keys, and will
 *  see the usual :focus and .subfocus visual cues when doing so.
 */
dynamicList.List.addMethod('setCursor', function (newCursor) {
    // Other parts of the UI may move the cursor without wanting to move focus;
    // do not grab keyboard focus when this happens.
    var hadFocus = false;
    if (document.activeElement && jQuery.contains(this._getElement(), document.activeElement)) {
        hadFocus = true;
    }    // The old cursor, if any (and if rendered), needs the CSS class removed.
    // The old cursor, if any (and if rendered), needs the CSS class removed.
    if (this.cursor && this.cursor.getList() && this.cursor._getElement()) {
        jQuery(this.cursor._getElement()).removeClass('cursor');
    }    // Whether it's been rendered or not, this is the new cursor.
    // Whether it's been rendered or not, this is the new cursor.
    this.cursor = newCursor;    // Keep in mind the cursor may not have been assigned to list yet, or
    // rendered yet.  If it has been, assign the CSS class.
    // Keep in mind the cursor may not have been assigned to list yet, or
    // rendered yet.  If it has been, assign the CSS class.
    if (newCursor && newCursor.getList() && newCursor._getElement()) {
        this.scrollUpTo(newCursor);
        if (this._allowSelections && this._selectionDefaultsToCursor) {
            if (this.getSelectedItems().length < 1) {
                this.selectItem(newCursor);
            }
        }
        if (hadFocus) {
            jQuery(this.cursor._getElement()).focus();
        }
        jQuery(this.cursor._getElement()).addClass('cursor');
    }
});    /**
 */
/**
 */
dynamicList.List.addMethod('getCursor', function () {
    if (this.cursor && this.cursor.getList() && this.cursor._getElement()) {
        // When filtering results, we can wind up with cursors that aren't
        // actually visible anymore, because the list has been refreshed with
        // filtered results.  However, checking for that is deferred until this
        // point, to avoid interrupting an extended rendering sequence in a
        // detached subtree that has not yet been appended to the DOM.
        //
        // TODO: Evaluate whether this would more appropriately check for the
        // visibility within the list container itself, rather than the overall
        // document.  Ensure headless testing does not break, however.
        if (jQuery(this.cursor._getElement()).closest('BODY').length > 0) {
            return this.cursor;
        }
    }    // No suitable cursor; use the most recently selected item, if any.
    // No suitable cursor; use the most recently selected item, if any.
    if (this._selectedItems.length > 0) {
        if (this._selectedItems[this._selectedItems.length - 1]._getElement()) {
            this.setCursor(this._selectedItems[this._selectedItems.length - 1]);    // Again, as in the case above, this is only useful if the item has
            // not been filtered out, although this should not occur.
            // Again, as in the case above, this is only useful if the item has
            // not been filtered out, although this should not occur.
            if (jQuery(this.cursor._getElement()).closest('BODY').length > 0) {
                return this.cursor;
            }
        }
    }    // No cursor or selected items, or possibly, no items in the list.
    // Promote the first list item, if one exists.
    // No cursor or selected items, or possibly, no items in the list.
    // Promote the first list item, if one exists.
    if (this._items.length > 0) {
        this.setCursor(this._items[0]);
        return this.cursor;
    }    // No items in the list.
    // No items in the list.
    return null;
});    /**
 * @return {Array}
 */
/**
 * @return {Array}
 */
dynamicList.List.addMethod('getCursorElement', function () {
    // No items in the list, return null.
    if (this.getCursor()) {
        return this.getCursor()._getElement();
    } else {
        return null;
    }
});    /**
 * @return {Array}
 */
/**
 * @return {Array}
 */
dynamicList.List.addMethod('getSelectedItems', function () {
    return this._selectedItems;
});    /**
 * @param item {dynamicList.ListItem} -
 */
/**
 * @param item {dynamicList.ListItem} -
 */
dynamicList.List.addMethod('isItemSelected', function (item) {
    return this.getSelectedItems().include(item);
});    /**
 * @param item {dynamicList.ListItem} -
 */
/**
 * @param item {dynamicList.ListItem} -
 */
dynamicList.List.addMethod('selectItem', function (item, isCtrlHeld, isShiftKeyHeld, isContextMenu) {
    var event = this.fire(this.Event.ITEM_BEFORE_SELECT_OR_UNSELECT, { item: item });
    if (event.stopSelectOrUnselect) {
        return;
    }    // Fix for multiple DnD.
    // If couple items selected and _selectOnMousedown enabled
    // we need deselect items on mouse up to be able Drag them.
    // Fix for multiple DnD.
    // If couple items selected and _selectOnMousedown enabled
    // we need deselect items on mouse up to be able Drag them.
    if (this._multiSelect && this._selectedItems.length > 1 && this.isItemSelected(item) && !(isCtrlHeld || isShiftKeyHeld || isContextMenu)) {
        return;
    }
    var isContextMenuOnSelected = this.isItemSelected(item) && isContextMenu;
    var reset = !(this._multiSelect && isCtrlHeld) && !isContextMenuOnSelected;
    var deselect = this.isItemSelected(item) && isCtrlHeld && !isContextMenuOnSelected;
    var selectRange = this._multiSelect && !deselect && isNotNullORUndefined(this._lastSelectedItem) && isShiftKeyHeld;
    var select = !deselect && !selectRange;
    if (reset) {
        this.resetSelected();
    }
    if (deselect && !reset) {
        this._removeItemFromSelected(item);
    }
    if (selectRange) {
        var start = this._items.indexOf(this._lastSelectedItem);
        var end = this._items.indexOf(item);
        var min = Math.min(start, end), max = Math.max(start, end);
        if (min > -1) {
            for (var i = min; i <= max; i++) {
                this._addItemToSelected(this._items[i], false);
            }
        } else {
            this._addItemToSelected(this._items[max], false);
        }
    }
    if (select) {
        this._addItemToSelected(item, !(isShiftKeyHeld && this._multiSelect));
    }    // Move the cursor to the most recently selected or deselected item.
    // Move the cursor to the most recently selected or deselected item.
    this.setCursor(item);
    jQuery(item._getElement()).children('[role="row"]').attr("aria-selected", "true");
});    /**
 * @param item {dynamicList.ListItem} -
 */
/**
 * @param item {dynamicList.ListItem} -
 */
dynamicList.List.addMethod('deselectItem', function (item) {
    this._removeItemFromSelected(item);    // Move the cursor to the most recently selected or deselected item.
    // Move the cursor to the most recently selected or deselected item.
    this.setCursor(item);
});
dynamicList.List.addMethod('deselectOthers', function (item, isCtrlHeld, isShiftKey, isContextMenu) {
    var event = this.fire(this.Event.ITEM_BEFORE_SELECT_OR_UNSELECT, { item: item });
    if (event.stopSelectOrUnselect) {
        return;
    }    // Fix for multiple DnD.
    // If couple items selected and _selectOnMousedown enabled
    // we need deselect items on mouse up to be able Drag them.
    // Fix for multiple DnD.
    // If couple items selected and _selectOnMousedown enabled
    // we need deselect items on mouse up to be able Drag them.
    if (this._multiSelect && this._selectedItems.length > 1 && this.isItemSelected(item) && !(isCtrlHeld || isShiftKey || isContextMenu)) {
        var items = this._selectedItems.findAll(function (i) {
            return i != item;
        });
        items.each(function (i) {
            this._removeItemFromSelected(i);
        }.bind(this));
    }
});    /**
 *
 */
/**
 *
 */
dynamicList.List.addMethod('resetSelected', function (skipParent) {
    var items = this._selectedItems;
    let itemsLength = items.length;
    if(!itemsLength && this.cursor){
        let cursorEl = this.cursor._getElement();
        jQuery(cursorEl).removeClass('selected');
    }
    this._selectedItems = [];
    items.each(function (item) {
        var thatList = item.getList();
        if (thatList) {
            if (thatList !== this) {
                thatList.resetSelected(true);
            }
        }
        item.refreshStyle();
        this.fire(this.Event.ITEM_UNSELECTED, { item: item });
        jQuery(item._getElement()).children('[role="row"]').attr("aria-selected", "false");
    }.bind(this));
    if (this._parentList && !skipParent) {
        this._parentList.resetSelected();
    }
});    /** Ensure the item is visible in the viewport, to avoid scroll jumps when it
 *  is focused.  If the item is fully visible, regardless of absolute position
 *  on the screen, nothing happens.  If the item is offscreen, or partially
 *  offscreen, the scrollbar position moves down just far enough to fully show
 *  the item.  If the item is actually larger than the viewport (which is
 *  presumed to be possible, if subitems are expanded), than the top of the
 *  item is scrolled to the top of the viewport.
 *
 */
/** Ensure the item is visible in the viewport, to avoid scroll jumps when it
 *  is focused.  If the item is fully visible, regardless of absolute position
 *  on the screen, nothing happens.  If the item is offscreen, or partially
 *  offscreen, the scrollbar position moves down just far enough to fully show
 *  the item.  If the item is actually larger than the viewport (which is
 *  presumed to be possible, if subitems are expanded), than the top of the
 *  item is scrolled to the top of the viewport.
 *
 */
dynamicList.List.addMethod('scrollDownTo', function (item) {
    var scrollEl = this._getElement().parentNode;
    if (!scrollEl || !item || !item._getElement()) {
        // Keep the testing framework happy; normally these would never be
        // detatched from the DOM.
        return;
    }
    var scrollTop = scrollEl.scrollTop;
    var scrollPortHeight = scrollEl.offsetHeight;
    var itemYPos = item._getElement().offsetTop;
    var itemHeight = item._getElement().offsetHeight;    // TODO: more work if the item is actually taller than the scroll viewport
    // (might happen for expanded items with many subitems).
    // TODO: more work if the item is actually taller than the scroll viewport
    // (might happen for expanded items with many subitems).
    var correction = itemYPos + itemHeight - (scrollTop + scrollPortHeight);
    if (correction > 0) {
        scrollEl.scrollTop += correction;
    }
});    /** Ensure the item is visible in the viewport, to avoid scroll jumps when it
 *  is focused.  If the item is fully visible, regardless of absolute position
 *  on the screen, nothing happens.  If the item is offscreen, or partially
 *  offscreen, the scrollbar position moves down just far enough to fully show
 *  the item.  If the item is actually larger than the viewport (which is
 *  presumed to be possible, if subitems are expanded), than the top of the
 *  item is scrolled to the top of the viewport.
 */
/** Ensure the item is visible in the viewport, to avoid scroll jumps when it
 *  is focused.  If the item is fully visible, regardless of absolute position
 *  on the screen, nothing happens.  If the item is offscreen, or partially
 *  offscreen, the scrollbar position moves down just far enough to fully show
 *  the item.  If the item is actually larger than the viewport (which is
 *  presumed to be possible, if subitems are expanded), than the top of the
 *  item is scrolled to the top of the viewport.
 */
dynamicList.List.addMethod('scrollUpTo', function (item) {
    var scrollEl = this._getElement().parentNode;
    if (!scrollEl || !item || !item._getElement()) {
        // Keep the testing framework happy; normally these would never be
        // detatched from the DOM.
        return;
    }
    var scrollTop = scrollEl.scrollTop;
    var itemYPos = item._getElement().offsetTop;  // Hack to try and deal with column headers.  The header should NOT have
    // been included in the scrollable region.
    // FIXME-- remove the header from the scrollable region, then remove this
    // hack.  Note the potentially invalid assumption that the header has the
    // same height as an item.
    // Hack to try and deal with column headers.  The header should NOT have
    // been included in the scrollable region.
    // FIXME-- remove the header from the scrollable region, then remove this
    // hack.  Note the potentially invalid assumption that the header has the
    // same height as an item.
    var headerHeight = item._getElement().offsetHeight;    // TODO: more work if the item is actually taller than the scroll viewport
    // (might happen for expanded items with many subitems).
    // TODO: more work if the item is actually taller than the scroll viewport
    // (might happen for expanded items with many subitems).
    var correction = scrollTop + headerHeight - itemYPos;
    if (correction > 0) {
        scrollEl.scrollTop -= correction;
    }
});    /**
 * @param item - reference item
 */
/**
 * @param item - reference item
 */
dynamicList.List.addMethod('getNextItem', function (item) {
    var items = this.getItems();
    var currentIndex = items.indexOf(item);
    return ~currentIndex ? this.getItems()[currentIndex + 1] : null;
});    /**
 * @param item - reference item
 */
/**
 * @param item - reference item
 */
dynamicList.List.addMethod('getPreviousItem', function (item) {
    var items = this.getItems();
    var currentIndex = items.indexOf(item);
    return ~currentIndex ? this.getItems()[currentIndex - 1] : null;
});    /**
 * @param event
 */
/**
 * @param event
 */
dynamicList.List.addMethod('selectNext', function (event) {
    var baseEvent = event.memo.targetEvent;
    var item = this.getCursor();
    var subItem = null, nextItem = null;    // See if there is a sublist open; if so, transfer responsibility there,
    // unless we were already on the last subitem, in which case, fall through.
    // See if there is a sublist open; if so, transfer responsibility there,
    // unless we were already on the last subitem, in which case, fall through.
    if (item._subList && item._getElement() && jQuery(item._getElement()).hasClass(layoutModule.OPEN_CLASS)) {
        // If we're moving into the sublist directly from the parent, ensure we
        // go to the first item.
        if (!jQuery(item._getElement()).hasClass('supercursor')) {
            if (item._subList.getItems().length > 0) {
                nextItem = item._subList.getItems()[0];
                jQuery(item._getElement()).addClass('supercursor');
                baseEvent.preventDefault();
                baseEvent.stopPropagation();
                item._subList.setCursor(nextItem);
                jQuery(item._subList.cursor._getElement()).focus();
                return;
            }
        }
        subItem = item._subList.getCursor();
        nextItem = subItem.getList().getNextItem(subItem);
        if (nextItem) {
            // Yes, another subitem is available.  Go deal with it.
            return subItem.getList().selectNext(event);
        }
    }    // Either no sublist, sublist is closed,  or out of subitems; select next
    // peer.
    // Either no sublist, sublist is closed,  or out of subitems; select next
    // peer.
    jQuery(item._getElement()).removeClass('supercursor');
    if (item._subList) {
        item._subList.cursor = null;
    }
    nextItem = item.getList().getNextItem(item);
    if (nextItem) {
        if (this._multiSelect && isShiftHeld(baseEvent)) {
            if (this.isItemSelected(nextItem)) {
                item.getList().deselectItem(item);
            } else {
                this._addItemToSelected(nextItem, false);
            }
        } else {
            this.resetSelected();
            item.getList().selectItem(nextItem);
        }    // NOTE: Implies scroll, refresh, and possibly selection.
        // NOTE: Implies scroll, refresh, and possibly selection.
        this.setCursor(nextItem);
    }
    baseEvent.preventDefault();
    baseEvent.stopPropagation();
});    /**
 * @param event
 */
/**
 * @param event
 */
dynamicList.List.addMethod('selectPrevious', function (event) {
    var baseEvent = event.memo.targetEvent;
    var item = this.getCursor();
    var subItem = null, previousItem = null;    // See if there is a sublist open; if so, transfer responsibility there,
    // unless we were already on main item, in which case, fall through; or we
    // were on the first subitem, in which case, move focus to the main item.
    // See if there is a sublist open; if so, transfer responsibility there,
    // unless we were already on main item, in which case, fall through; or we
    // were on the first subitem, in which case, move focus to the main item.
    if (jQuery(item._getElement()).hasClass('supercursor')) {
        subItem = item._subList.getCursor();
        previousItem = subItem.getList().getPreviousItem(subItem);
        if (previousItem) {
            // Yes, a previous subitem is available.  Go deal with it.
            return subItem.getList().selectPrevious(event);
        } else {
            // No previous subitem is available.  Select the main item instead.
            if (item._subList.cursor) {
                if (item._subList.cursor._element) {
                    jQuery(item._subList.cursor._element).removeClass('cursor');
                }
                item._subList.cursor = null;
            }
            if (!(isShiftHeld(baseEvent) && this._multiSelect)) {
                item._subList.resetSelected();
            }
            jQuery(item._getElement()).removeClass('supercursor');
            this.setCursor(item);
            stdnav.forceFocus(jQuery(item._getElement()))
        }
    } else {
        // Normal case-- no sublist, or main item selected.
        previousItem = item.getList().getPreviousItem(item);
        if (previousItem) {
            if (this._multiSelect && isShiftHeld(baseEvent)) {
                if (this.isItemSelected(previousItem)) {
                    item.getList().deselectItem(item);
                } else {
                    this._addItemToSelected(previousItem, false);
                }
            } else {
                const isLabelItem = previousItem.first && previousItem._value.isLabel;
                if(isLabelItem) {
                    return;
                }
                this.resetSelected();
                item.getList().selectItem(previousItem);
                // previous item has sublist and its open then iterate through it
                if (previousItem?._subList?.getItems().length > 0 &&
                    jQuery(previousItem._getElement()).hasClass(layoutModule.OPEN_CLASS)) {
                    item = previousItem;
                    previousItem = _.last(item._subList.getItems());
                    jQuery(item._getElement()).addClass('supercursor');
                    baseEvent.preventDefault();
                    baseEvent.stopPropagation();
                    item._subList.setCursor(previousItem);
                    stdnav.forceFocus(jQuery(item._subList.cursor._getElement()))
                    //jQuery(item._subList.cursor._getElement()).focus();
                    return;
                }

            }// NOTE: Implies scroll, refresh, and possibly selection.
            this.setCursor(previousItem);
        }
    }
    baseEvent.preventDefault();
    baseEvent.stopPropagation();
});    /**
 * @param event
 */
/**
 * @param event
 */
dynamicList.List.addMethod('selectPageDown', function (event) {
    var baseEvent = event.memo.targetEvent;
    baseEvent.preventDefault();
    baseEvent.stopPropagation();
    var item = this.getCursor();    // FIXME-- the header is part of the scrollable region; it shouldn't be.
    // Use the height of whatever item is handy to stand in for the header.
    // FIXME-- the header is part of the scrollable region; it shouldn't be.
    // Use the height of whatever item is handy to stand in for the header.
    var headerHack = item._getElement().offsetHeight;    // Since items may vary in height, figure out the scroll offset of the next
    // page disregarding the items, then figure out the most sensible item to
    // reposition to.
    // Since items may vary in height, figure out the scroll offset of the next
    // page disregarding the items, then figure out the most sensible item to
    // reposition to.
    var scrollEl = this._getElement().parentNode;
    var newScrollTop = scrollEl.scrollTop + (scrollEl.offsetHeight - headerHack);
    if (newScrollTop > scrollEl.offsetHeight) {
        newScrollTop = scrollEl.offsetHeight;
    }
    scrollEl.scrollTop = newScrollTop;
    var iterItem = item, nextItem = null;
    while (iterItem && iterItem._getElement().offsetTop + iterItem._getElement().offsetHeight < scrollEl.scrollTop + scrollEl.offsetHeight) {
        nextItem = iterItem;
        if (isShiftHeld(baseEvent)) {
            if (this.isItemSelected(nextItem)) {
                item.getList().deselectItem(item);
            } else {
                this._addItemToSelected(nextItem, false);
            }
        }
        iterItem = nextItem.getList().getNextItem(nextItem);
    }
    if (nextItem) {
        if (!(this._multiSelect && isShiftHeld(baseEvent))) {
            this.resetSelected();
            item.getList().selectItem(nextItem);
        }    // NOTE: Implies scroll, refresh, and possibly selection.
        // NOTE: Implies scroll, refresh, and possibly selection.
        this.setCursor(nextItem);
    }
});
dynamicList.List.addMethod('selectPageUp', function (event) {
    var baseEvent = event.memo.targetEvent;
    baseEvent.preventDefault();
    baseEvent.stopPropagation();
    var item = this.getCursor();    // FIXME-- the header is part of the scrollable region; it shouldn't be.
    // Use the height of whatever item is handy to stand in for the header.
    // FIXME-- the header is part of the scrollable region; it shouldn't be.
    // Use the height of whatever item is handy to stand in for the header.
    var headerHack = item._getElement().offsetHeight;    // Since items may vary in height, figure out the scroll offset of the next
    // page disregarding the items, then figure out the most sensible item to
    // reposition to.
    // Since items may vary in height, figure out the scroll offset of the next
    // page disregarding the items, then figure out the most sensible item to
    // reposition to.
    var scrollEl = this._getElement().parentNode;
    var newScrollTop = scrollEl.scrollTop + (scrollEl.offsetHeight - headerHack);
    if (newScrollTop > scrollEl.offsetHeight) {
        newScrollTop = scrollEl.offsetHeight;
    }
    scrollEl.scrollTop = newScrollTop;
    var iterItem = item, previousItem = null;
    while (iterItem && iterItem._getElement().offsetTop > scrollEl.scrollTop - scrollEl.offsetHeight) {
        previousItem = iterItem;
        if (this._multiSelect && isShiftHeld(baseEvent)) {
            if (this.isItemSelected(previousItem)) {
                item.getList().deselectItem(item);
            } else {
                this._addItemToSelected(previousItem, false);
            }
        }
        iterItem = previousItem.getList().getPreviousItem(previousItem);
    }
    if (previousItem) {
        if (!(this._multiSelect && isShiftHeld(baseEvent))) {
            this.resetSelected();
            item.getList().selectItem(previousItem);
        }    // NOTE: Implies scroll, refresh, and possibly selection.
        // NOTE: Implies scroll, refresh, and possibly selection.
        this.setCursor(previousItem);
    }
});
dynamicList.List.addMethod('selectFirst', function () {
    if (this._items[0]) {
        this.resetSelected();
        this.setCursor(this._items[0]);
    }
});


dynamicList.List.addMethod('selectLast', function () {
    if (this._items[this._items.length - 1]) {
        this.resetSelected();
        this.setCursor(this._items[this._items.length - 1]);
    }
});

/**
 * @param event
 */
dynamicList.List.addMethod('selectOutwards', function (event) {
    let item = this.getSelectedItems()[0];

    if (!item) {
        item = this.cursor;
    }

    if (!item) {
        return;
    }

    let element = item._getElement();
    let outItem = !baseList.isItemOpen(element) && item.parentItem;

    let source = event.target;
    let isRoleRow = jQuery(source).attr("role")==="row"

    // Todo : fix  left key press on sublist focus move to parent list and collapse list

    if(isRoleRow) {
        if (outItem) {
            // focus should go on parent on first press of right arrow
            this.resetSelected();
            outItem.select();
            outItem._getElement().focus();
            jQuery('.subfocus').removeClass('subfocus');
            jQuery(outItem._getElement()).addClass('subfocus').addClass('focus-visible').removeClass("supercursor");
        } else {
            let source = event.target;
            jQuery(source).attr('aria-expanded', false);
            baseList.closeItem(element);
            item.getList().selectItem(item);
            item._getElement().focus();
            jQuery('.subfocus').removeClass('subfocus');
            jQuery(item._getElement()).addClass('subfocus').addClass('focus-visible');
            this.fire(this.Event.ITEM_CLOSED, {
                targetEvent: event,
                item: item
            });
        }
    }else {
        let gridItem;
        let dataCellElement = jQuery(source).is('[data-cell]')? jQuery(source) : jQuery(source).closest('[data-cell]');
        let currentCell = dataCellElement? parseInt(jQuery(dataCellElement).attr('data-cell')) : null;
        let parent = jQuery(source).closest('[role ="row"]');
        let isFirstCellVisible = jQuery(parent).find("[data-cell=0]").first().css("visibility") !== "hidden";
        if (currentCell === 0 && isFirstCellVisible) {
            gridItem = parent
        } else if (currentCell === 1 && !isFirstCellVisible) {
            gridItem = parent
        } else {
            do {
                gridItem = jQuery(parent).find(`[data-cell='${--currentCell}']`).first();
            } while (gridItem.length === 1 && gridItem.css("visibility") === "hidden");
        }
        if (gridItem.length > 0) stdnav.forceFocus(gridItem);
    }
});    /**
 * @param event
 */
/**
 * @param event
 */
dynamicList.List.addMethod('selectInwards', function (event) {
    /*
      1.If there is no cursor for some reason (possibly during construction?)
        then use the first selected item.  If there is neither a cursor nor any
        selected items, abort.
      2.if sublist exists and its not expanded then sublist will open first
      3.if sublist is expaned then on next right click parentlist item get focused.

      Note : refer right keyboard navigation treegrid sample :
        https://www.w3.org/TR/wai-aria-practices-1.1/examples/treegrid/treegrid-1.html
  */

    let item = this.cursor;
    let source =  event.target;

    if (!item) {
        if (this.getSelectedItems().length < 1) {
            return;
        }
        item = this.getSelectedItems()[0];
    }
    let element = item._getElement();
    if (item.isComposite && !baseList.isItemOpen(element)) {
        baseList.openItem(element);

        jQuery(source).attr('aria-expanded', true);
        this.fire(this.Event.ITEM_OPEN, {
            targetEvent: event,
            item: item
        });
    }else{
        let isRoleRow = jQuery(source).attr("role")==="row";
        let gridItem;

        if (isRoleRow) {
            gridItem = jQuery(source).find("[data-cell=0]").css("visibility") === "hidden" ?
                jQuery(source).find("[data-cell=1]").first() :
                jQuery(source).find("[data-cell=0]").first();
        } else {
            let dataCell = +jQuery(source).attr('data-cell');
            let parent = jQuery(source).closest('[role ="row"]');

            do {
                gridItem =jQuery(parent).find(`[data-cell='${++dataCell}']`).first();
            } while(gridItem.length === 1 && gridItem.css("visibility") === "hidden");
        }
        if(gridItem.length > 0) stdnav.forceFocus(gridItem);

    }
});    /**
 * Render list items. Use this method when you need to re-render list.
 */
/**
 * Render list items. Use this method when you need to re-render list.
 */
dynamicList.List.addMethod('show', function () {
    dynamicList.activeListId = this.getId();
    this._getElement().update();
    var items = this.getItems();
    var itemsAmount = items.length;
    items.each(function (item, index) {
        item.first = index === 0;
        item.last = index === itemsAmount - 1;
        item.show(this._getElement());
    }.bind(this));
    this.draggables = [];
    this.scroll && this.scroll.refresh();
    this._initEvents();
});    /**
 * Updates UI from value of the item and remove unused DOM elements (li elements)
 */
/**
 * Updates UI from value of the item and remove unused DOM elements (li elements)
 */
dynamicList.List.addMethod('refresh', function () {
    if (!this._getElement()) {
        // List has not been rendered yet.
        return;
    }
    let elements = this._getElement().childElements(), itemElements = [];
    this.getItems().each(function (item, index) {
        item.first = index === 0;
        item.last = index === this.getItems().length - 1;
        if (item.isRendered()) {
            if (item.index() != elements.indexOf(item._getElement())) {
                var wasOpened = baseList.isItemOpen(item._getElement());
                item._getElement().remove();
                item.show(this._getElement());
                if (wasOpened) {
                    baseList.openItem(item._getElement());
                }
            } else {
                item.refresh();
            }
        } else {
            item.show(this._getElement());
        }
        itemElements.push(item._getElement());
    }.bind(this));
    elements.each(function (e) {
        if (!itemElements.include(e) && e.parentNode) {
            e.remove();
        }
    });
    // Ensure that the list has a cursor.
    this.getCursor();
    // Get the current scroll offset, so it can be sustained after refreshing
    // the list.
    var scrollEl = this._getElement().parentNode, scrollTop;
    if (!scrollEl) {
        // Keep the testing framework happy; normally these would never be
        // detatched from the DOM.
        scrollTop = 0;
    } else {
        scrollTop = scrollEl.scrollTop;
    }
    this.refreshStyle();
    let cursor = this.getCursor(), cursorWasFocus = false;
    if (cursor && cursor.getList() && cursor._getElement()) {
        if (document.activeElement === cursor._getElement() || jQuery.contains(cursor._getElement(), document.activeElement)) {
            cursorWasFocus = true;
        }
    }
    //this.scroll && this.scroll.refresh();
    this.setCursor(cursor);    // Refresh can result in loss of focus under certain circumstances.
    // Refresh can result in loss of focus under certain circumstances.
    if (cursorWasFocus) {
        jQuery(this.getCursorElement())[0].focus();
    }
    // Finally, restore the scroll offset.  This is necessary if the list was
    // manually scrolled so that the cursor is no longer visible.
    if (scrollEl) {
        scrollEl.scrollTop = scrollTop;
    }
});    /**
 * Refreshing classname of the list
 */
/**
 * Refreshing classname of the list
 */
dynamicList.List.addMethod('refreshStyle', function (clean) {
    var element = this._getElement();
    if (!element) {
        // List has not been rendered yet.
        return;
    }
    if (element.templateClassName) {
        element.className = element.templateClassName;
    }
    if (this._cssClassName) {
        jQuery(element).addClass(this._cssClassName);
    }
});    /**
 * Generates custom event of the list.
 *
 * @param eventName
 */
/**
 * Generates custom event of the list.
 *
 * @param eventName
 */
dynamicList.List.addMethod('fire', function (eventName, memo) {
    var element = jQuery(this._getElement())[0];
    if (element) {
        return element.fire(eventName, memo);
    } else {
        return null;
    }
});    /**
 * @param eventName
 */
/**
 * @param eventName
 */
dynamicList.List.addMethod('observe', function (eventName, handler) {
    this._getElement().observe(eventName, handler);
});    /**
 * @param eventName
 */
/**
 * @param eventName
 */
dynamicList.List.addMethod('stopObserving', function (eventName, handler) {
    this._getElement().stopObserving(eventName, handler);
});    ///////////////////////////////////////////////////////
// List private methods
///////////////////////////////////////////////////////
/**
 * Gets list container
 * @return {DOMElement}
 */
///////////////////////////////////////////////////////
// List private methods
///////////////////////////////////////////////////////
/**
 * Gets list container
 * @return {DOMElement}
 */
dynamicList.List.addMethod('_getElement', function () {
    if (!this._element) {
        // TODO: Improve performance by using a jQuery lookup specifically on
        // the list subdom, rather than the whole page.
        this._element = jQuery('#' + this.getId())[0];
    }
    return this._element;
});    /**
 * Gets the item from the event in list
 *
 * @paran {Event}
 */
/**
 * Gets the item from the event in list
 *
 * @paran {Event}
 */
dynamicList.List.addMethod('getItemByEvent', function (event) {
    if (event) {
        var element = Event.element(event);    //event.originalTarget || event.srcElement;
        //event.originalTarget || event.srcElement;
        while (element && element.readAttribute && jQuery(element).attr('id') !== this.getId()) {
            var item = element.listItem;
            if (item && item.getList() != null) {
                var itemList = item.getList(), idsAreEqual = itemList.getId() == this.getId(), parentListContainsChild = this._getElement().contains(itemList._getElement());
                if (idsAreEqual || parentListContainsChild) {
                    item._label = xssUtil.unescape(item._label);
                    return item;
                } else {
                    break;
                }
            } else {
                element = jQuery( element.parentNode)[0];
            }
        }
    }
    return null;
});
dynamicList.List.addMethod('_createFromTemplate', function () {
    var tabindex = jQuery(this._getElement()).attr('tabindex');
    this.tabindex = parseInt(tabindex && tabindex.length > 0 ? tabindex : -1);
    this._getElement().insert({ after: this._getTemplateElement(this._getElement()) });
    this._getElement().remove();
    this._element = null;
    this._getElement().update();
    this.tabindex && this.tabindex.length > 0 && jQuery(this._getElement()).attr('tabindex', this.tabindex);
    disableSelectionWithoutCursorStyle(this._getElement());
});
dynamicList.List.addMethod('_getTemplateElement', function (currentElement) {
    var id = this._listTemplateDomId;
    if (!dynamicList._templateHash[id]) {
        dynamicList._templateHash[id] = id;
    }
    var clone = document.getElementById(dynamicList._templateHash[id]).clone(true);
    jQuery(clone).attr('id', this.getId());    //clone.down().writeAttribute("tabIndex", -1);
    //clone.down().writeAttribute("tabIndex", -1);
    clone.templateId = id;
    clone.templateClassName = clone.className;
    cloneCustomAttributes(currentElement, clone);
    return clone;
});
dynamicList.List.addMethod('_addItemToSelected', function (item, remember) {
    if (item && !this.isItemSelected(item)) {
        this._selectedItems.push(item);
        if (remember) {
            this._lastSelectedItem = item;
        }    //        item.focus();
        //        item.focus();
        item.refreshStyle();
        if (this._parentList) {
            this._parentList._addItemToSelected(item, remember);
        } else {
            this.fire(this.Event.ITEM_SELECTED, { item: item });
        }
    }
});
dynamicList.List.addMethod('_removeItemFromSelected', function (item) {
    if (item && this.isItemSelected(item)) {
        this._selectedItems = this._selectedItems.without(item);
        item.refreshStyle();
        if (this._parentList) {
            this._parentList._removeItemFromSelected(item);
        } else {
            this.fire(this.Event.ITEM_UNSELECTED, { item: item });
        }
    }
});
dynamicList.List.addMethod('_buildDnDOverlay', function (element) {
    //    var wrapper = $(this.DND_WRAPPER_TEMPLATE).cloneNode(true), template = $(this.DND_ITEM_TEMPLATE).cloneNode(true);
    element.setStyle({
        width: null,
        height: null
    });
    if (element.items.length > 1) {
        element.update(this._msgNItemsSelected.evaluate({ count: element.items.length }));
    } else if (element.items.length == 1) {
        element.update(xssUtil.hardEscape(element.items[0].getLabel()));
    }
});
dynamicList.List.addMethod('_registerCustomScroll', function () {
    if (!this.scroll && this._getElement()) {
        var scrollBar = this._getElement().up(layoutModule.SWIPE_SCROLL_PATTERN);
        if (scrollBar) {
            var scroll = layoutModule.scrolls.get(scrollBar.identify());
            scroll && (this.scroll = scroll);
        }
    }
});    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// List DnD
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// List DnD
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
dynamicList.List.addMethod('createDraggableIfNeeded', function (event) {
    //make draggable - test in this order - for efficiency
    //test 1) does the tree have any drag patterns?
    //test 2) is a draggable already created for the clicked element?
    //test 3) does clicked element or its ancestors match any draggable patterns?
    //test 4) is a draggable already created for the clicked element or matching ancestor?
    //5) if it's complex markup then we go up to parent which matching pattern
    var thisElem = event.element ? event.element() : event.target;
    if (this.dragPattern && !this.draggables[thisElem.identify()]) {
        var matchingElem = matchAny(thisElem, [this.dragPattern], true);
        if (matchingElem) {
            //matchingElem = matchingElem.up(this.dragPattern);
            if (!matchingElem || this.draggables[matchingElem.identify()]) {
                return;
            }
            var item = this.getItemByEvent(event);
            this.draggables[matchingElem.identify()] = new Draggable(matchingElem, {
                superghosting: true,
                mouseOffset: true,
                onStart: this.setDragStartState.bind(this, item),
                onEnd: this.setDragEndState.bind(this, item)
            });
        }
    }
});
dynamicList.List.addMethod('setDragStartState', function (item, draggable, event) {
    var templateClassName = item._getElement().templateClassName;
    if (templateClassName) {
        jQuery(draggable.element).addClass(templateClassName);
    }
    jQuery(draggable.element).addClass(layoutModule.DRAGGING_CLASS).addClass(this.getId());
    draggable.element.items = this.getSelectedItems().slice(0);
    this._buildDnDOverlay(draggable.element);
    draggable.options.scroll = this._getElement();
    draggable.options.scrollSensitivity = layoutModule.SCROLL_SENSITIVITY;
    Draggables.dragging = this.regionID || true;
});
dynamicList.List.addMethod('setDragEndState', function (draggable, event, item) {
    Draggables.dragging = null;
});    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// List event handling
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// List event handling
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
dynamicList.List.addMethod('_mouseupHandler', function (event) {
    var element = event.target;
    var item = matchMeOrUp(element, layoutModule.BUTTON_PATTERN) && this.getItemByEvent(event);
    if (!item || item._isElementInExcluded(event)) {
        return;
    }
    event.listEvent = true;
    if (item._respondOnItemEvents && !event.isInvoked) {
        this.fire(this.Event.ITEM_MOUSEUP, {
            targetEvent: event,
            item: item
        });
        if (!item._isExcludedFromSelectionTriggers(event)) {
            var isCtrlHeldValue = isMetaHeld(event), isShiftHeldValue = isShiftHeld(event), isContextMenuValue = isRightClick(event);    // NOTE: See also comments and logic for drag-and-drop, as these
            // functions overlap
            // NOTE: See also comments and logic for drag-and-drop, as these
            // functions overlap
            var isSelect = !this._selectOnMousedown && !TouchController.element_scrolled && (!isSupportsTouch() || event.changedTouches.length >= 1);
            isSelect && item.getList().selectItem(item, isCtrlHeldValue, isShiftHeldValue, isContextMenuValue);    // Fix for Shift key multiple selection if we change selection inside selected range.
            // We need to remember the position of current item as last selected even if selectItem method
            // did not do it. This will help to correctly determine select range start on next selectItem call.
            // Fix for Shift key multiple selection if we change selection inside selected range.
            // We need to remember the position of current item as last selected even if selectItem method
            // did not do it. This will help to correctly determine select range start on next selectItem call.
            if (!isSelect && this._multiSelect && this._selectedItems.length > 1 && this.isItemSelected(item) && !(isCtrlHeldValue || isShiftHeldValue || isContextMenuValue)) {
                this._lastSelectedItem = item;
            }
            item.getList().deselectOthers(item, isMetaHeld(event), isShiftHeld(event), isRightClick(event));
            if (this.twofingers) {
                this.twofingers = false;
                var li = jQuery(element).parents('li:first');
                li.hasClass('selected') && document.fire(layoutModule.ELEMENT_CONTEXTMENU, {
                    targetEvent: event,
                    node: element
                });
            }
        }
        this.createDraggableIfNeeded(event);
    }
    event.isInvoked = true;
});
dynamicList.List.addMethod('_mousedownHandler', function (event) {
    event = event.type == 'dataavailable' ? event.memo.targetEvent : event;
    var element = event.target;
    var item = matchMeOrUp(element, layoutModule.BUTTON_PATTERN + ',' + layoutModule.LIST_ITEM_WRAP_PATTERN) && this.getItemByEvent(event);
    if (!item || item._isElementInExcluded(event)) {
        return;
    }
    event.listEvent = true;
    let iconEvent = this._itemPreventEvent(item,event);
    if (event.touches && event.touches.length == 2) {
        this.twofingers = true;    //var li = jQuery(element).parents('li:first');
        //li.hasClass('selected') && document.fire(layoutModule.ELEMENT_CONTEXTMENU, {targetEvent: event, node: element});
        //return;
    } else {
        this.twofingers = false;
    }
    if (iconEvent){
        // Do not focus items that have only had their expanders clicked--
        // this will result in a fixFocus call to the current selection
        // (clicking on the expander will not change the selection), which
        // in turn will fix focus on the current selection, which may move
        // the newly-expanded item out of view.  (Clicking on the actual
        // item selects it prior to focusing, which avoids the problem.)
        event.stopPropagation();
        event.preventDefault();
    }
    else {
        if (item._respondOnItemEvents && !event.isInvoked) {
            this.fire(this.Event.ITEM_MOUSEDOWN, {
                targetEvent: event,
                item: item
            });
            if (!item._isExcludedFromSelectionTriggers(event)) {
                // FIXME: See if this can be moved into setCursor
                if (this._selectOnMousedown) {
                    // && (!isSupportsTouch() || event.touches.length == 1);
                    item.getList().selectItem(item, isMetaHeld(event), isShiftHeld(event), isRightClick(event));
                }
                if (this._setCursorOnMousedown && !isMetaHeld(event)) {
                    item.getList().setCursor(item);
                }
            }
            item.focus();
        }
    }
    event.isInvoked = true;
});
dynamicList.List.addMethod('_mouseoverHandler', function (event) {
    matchMeOrUp(event.target, layoutModule.BUTTON_PATTERN) && this.createDraggableIfNeeded(event);
});
dynamicList.List.addMethod('_clickHandler', function (event) {
    var item = matchMeOrUp(event.target, layoutModule.BUTTON_PATTERN) && this.getItemByEvent(event);
    if (!item || item._isElementInExcluded(event)) {
        return;
    }
    if (!event.isInvoked) {
        if (item._respondOnItemEvents) {
            this.fire(this.Event.ITEM_CLICK, {
                targetEvent: event,
                item: item
            });
        }
        if (!item.isComposite)
            return;
        var element = item._getElement(), source = event.target;
        if (item._isCloseHandler(source) && baseList.isItemOpen(element)) {
            jQuery(source).attr('aria-expanded', false);
            baseList.closeItem(element);
            this.fire(this.Event.ITEM_CLOSED, {
                targetEvent: event,
                item: item
            });
        } else if (item._isOpenHandler(source) && !baseList.isItemOpen(element)) {
            jQuery(source).attr('aria-expanded', true);
            baseList.openItem(element);
            this.fire(this.Event.ITEM_OPEN, {
                targetEvent: event,
                item: item
            });
        }
    }
    event.isInvoked = true;
});
dynamicList.List.addMethod('_dblclickHandler', function (event) {
    var item = matchMeOrUp(event.target, layoutModule.BUTTON_PATTERN) && this.getItemByEvent(event);
    if (!item || item._isElementInExcluded(event)) {
        return;
    }
    if (item._respondOnItemEvents && !event.isInvoked) {
        this.fire(this.Event.ITEM_DBLCLICK, {
            targetEvent: event,
            item: item
        });
    }
    event.isInvoked = true;
});
dynamicList.List.addMethod('_initEvents', function () {
    var container = this._getElement();
    this.draggables = [];
    if (isSupportsTouch()) {
        container.stopObserving('touchstart').observe('touchstart', this._mousedownHandler.bindAsEventListener(this));    //scriptaculous stopped mousedown event but we made it throw this instead
        //scriptaculous stopped mousedown event but we made it throw this instead
        container.stopObserving('drag:touchstart').observe('drag:touchstart', this._mousedownHandler.bindAsEventListener(this));
        container.stopObserving('touchend').observe('touchend', this._mouseupHandler.bindAsEventListener(this));
    } else {
        container.stopObserving('mouseup').observe('mouseup', this._mouseupHandler.bindAsEventListener(this));
        container.stopObserving('mousedown').observe('mousedown', this._mousedownHandler.bindAsEventListener(this));    //scriptaculous stopped mousedown event but we made it throw this instead
        //scriptaculous stopped mousedown event but we made it throw this instead
        container.stopObserving('drag:mousedown').observe('drag:mousedown', this._mousedownHandler.bindAsEventListener(this));
    }
    if (!isIPad){
        container.stopObserving('mouseover').observe('mouseover', this._mouseoverHandler.bindAsEventListener(this));
    }
    if (this.listOrientation === "horizontal"){
        container.stopObserving('key:right').observe('key:right', this.selectNext.bindAsEventListener(this));
        container.stopObserving('key:left').observe('key:left', this.selectPrevious.bindAsEventListener(this));
    }else {
        container.stopObserving('click').observe('click', this._clickHandler.bindAsEventListener(this));
        container.stopObserving('dblclick').observe('dblclick', this._dblclickHandler.bindAsEventListener(this));
        container.stopObserving('key:down').observe('key:down', this.selectNext.bindAsEventListener(this));
        container.stopObserving('key:up').observe('key:up', this.selectPrevious.bindAsEventListener(this));
        container.stopObserving('key:right').observe('key:right', this.selectInwards.bindAsEventListener(this));
        container.stopObserving('key:left').observe('key:left', this.selectOutwards.bindAsEventListener(this));
        container.stopObserving('key:pagedown').observe('key:pagedown', this.selectPageDown.bindAsEventListener(this));
        container.stopObserving('key:pageup').observe('key:pageup', this.selectPageUp.bindAsEventListener(this));
        container.stopObserving('key:home').observe('key:home', this.selectFirst.bindAsEventListener(this));
        container.stopObserving('key:end').observe('key:end', this.selectLast.bindAsEventListener(this));
    }
});
dynamicList.List.addMethod('_itemPreventEvent',function(item , event){
    let isComposite = item.isComposite,
        isFavIcon = item.isIconClicked,
        isOpenOrCloseHandler = isComposite && (item._isOpenHandler(event.target) || item._isCloseHandler(event.target)),
        isFavHandler;
    if ( event.which !== 3 ) {
        isFavHandler = item._isFavoriteHandler(event.target);
    }

    const compositeItemSelectable = isComposite && ( isOpenOrCloseHandler||isFavHandler);
    const listItemSelectable = isFavIcon && isFavHandler;

    return compositeItemSelectable || listItemSelectable ;
});
// List element that is rendered from Underscore template string passed as an option
// List element that is rendered from Underscore template string passed as an option
dynamicList.UnderscoreTemplatedList = function (id, options) {
    if (options) {
        this._template = 'template' in options ? options.template : '';
    }
    dynamicList.List.apply(this, arguments);
};
var temporaryFunc = function () {
};
temporaryFunc.prototype = dynamicList.List.prototype;
dynamicList.UnderscoreTemplatedList.prototype = new temporaryFunc();
dynamicList.UnderscoreTemplatedList.prototype.constructor = dynamicList.UnderscoreTemplatedList;
dynamicList.UnderscoreTemplatedList.prototype._getTemplateElement = function (currentElement) {
    var element = jQuery(_.template(this._template, {}))[0];
    jQuery(element).attr('id', this.getId());
    element.templateClassName = element.className;
    cloneCustomAttributes(currentElement, element);
    return element;
};

export {dynamicList, baseList};
