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


import jQuery from 'jquery';
import JSEncrypter from 'js-sdk/src/common/util/encrypter';
import XRegExp from 'xregexp';
import orgModule from './org.user.mng.main';
import {ValidationModule, matchAny} from "../util/utils.common";
import RegExpRepresenter from '../tenantImportExport/utils/RegExpRepresenter';

import {isProVersion} from "../namespace/namespace";
import xssUtil from 'js-sdk/src/common/util/xssUtil';
import layoutModule from '../core/core.layout';
import buttonManager from '../core/core.events.bis';
import dialogs from '../components/components.dialogs';
import {dynamicList} from '../components/list.base';

orgModule.userManager.userList = {
    CE_LIST_TEMPLATE_ID: 'tabular_twoColumn',
    CE_ITEM_TEMPLATE_ID: 'tabular_twoColumn:leaf',
    PRO_LIST_TEMPLATE_ID: 'tabular_threeColumn',
    PRO_ITEM_TEMPLATE_ID: 'tabular_threeColumn:leaf',
    USER_ID_PATTERN: '.ID > a',
    USER_NAME_PATTERN: '.name',
    USER_ORGANIZATION_PATTERN: '.organization',
    initialize: function (options) {
        orgModule.entityList.initialize({
            listTemplateId: isProVersion() ? this.PRO_LIST_TEMPLATE_ID : this.CE_LIST_TEMPLATE_ID,
            itemTemplateId: isProVersion() ? this.PRO_ITEM_TEMPLATE_ID : this.CE_ITEM_TEMPLATE_ID,
            onLoad: function () {
                orgModule.fire(orgModule.userManager.Event.SEARCH_NEXT, {});
            },
            onSearch: function (text) {
                orgModule.fire(orgModule.userManager.Event.SEARCH, { text: text });
            },
            toolbarModel: options.toolbarModel,
            text: options.text
        });
        orgModule.entityList._createEntityItem = function (value) {
            var item = new dynamicList.ListItem({
                label: value.userName,
                value: value
            });
            item.processTemplate = function (element) {
                var id = jQuery(element).find(orgModule.userManager.userList.USER_ID_PATTERN);
                var name = jQuery(element).find(orgModule.userManager.userList.USER_NAME_PATTERN);
                id.html(xssUtil.hardEscape(this.getValue().userName));
                name.html(xssUtil.hardEscape(this.getValue().fullName));
                var tenantId = this.getValue().tenantId;
                if (isProVersion() && tenantId) {
                    var org = jQuery(element).find(orgModule.userManager.userList.USER_ORGANIZATION_PATTERN);
                    org.html(xssUtil.hardEscape(tenantId));
                }
                return element;
            };
            return item;
        };
    }
};    ////////////////////////////////////////
// Panel which shows user's properties
////////////////////////////////////////
////////////////////////////////////////
// Panel which shows user's properties
////////////////////////////////////////
orgModule.userManager.properties = {
    USER_NAME_PATTERN: '#userName',
    USER_ID_PATTERN: '#propUserID',
    EMAIL_PATTERN: '#email',
    ENABLE_USER_PATTERN: '#enableUser',
    EXTERNAL_USER_PATTERN: '#externalUser',
    PASSWORD_PATTERN: '#password',
    PASSWORD_CONFIRM_PATTERN: '#confirmPassword',
    _LOGIN_AS_USER_BUTTON: '#loginAsUser',
    user: null,
    initialize: function (options) {
        orgModule.properties.initialize(options._.extend({}, options, {
            viewAssignedListTemplateDomId: 'list_type_attributes',
            viewAssignedItemTemplateDomId: 'list_type_attributes:role',
            searchAssigned: false,
            showAssigned: true,
            attributes: {
                context: {
                    urlGETTemplate: "rest_v2/attributes?includeInherited=true&holder=user:{{if (tenantId) { }}/{{-tenantId}}{{ } }}/{{-userName}}&group=custom&excludeGroup=serverSettings",
                    urlPUTTemplate: "rest_v2{{ if (tenantId) { }}/organizations/{{-tenantId}}{{ } }}/users/{{-userName}}/attributes?_embedded=permission"
                }
            }
        }));
        var panel = jQuery('#' + orgModule.properties._id);
        this.name = panel.find(this.USER_NAME_PATTERN)[0];
        this.id = panel.find(this.USER_ID_PATTERN)[0];
        this.email = panel.find(this.EMAIL_PATTERN)[0];
        this.enabled = panel.find(this.ENABLE_USER_PATTERN)[0];
        this.external = panel.find(this.EXTERNAL_USER_PATTERN)[0];
        this.pass = panel.find(this.PASSWORD_PATTERN)[0];
        this.confirmPass = panel.find(this.PASSWORD_CONFIRM_PATTERN)[0];
        this.email.blurValidator = orgModule.createRegExpValidator(this.email, 'invalidEmail', XRegExp(orgModule.Configuration.emailRegExpPattern));
        this.pass.inputValidator = orgModule.createRegExpValidator(this.pass, 'passwordIsWeak', XRegExp(orgModule.Configuration.passwordPattern));
        this._validators = [
            this.email.blurValidator,
            this.pass.inputValidator,
            orgModule.createSameValidator(this.confirmPass, this.pass, 'invalidConfirmPassword')
        ];
        this._initCustomEvents();
        var signedUser = options.currentUser;
        orgModule.properties.setProperties = function (properties) {
            var umProperties = orgModule.userManager.properties;
            umProperties.name.setValue(properties.fullName);
            umProperties.id.setValue(properties.userName);
            umProperties.email.setValue(properties.email);
            umProperties.enabled.checked = properties.enabled;
            umProperties.external.checked = properties.external;
            umProperties.pass.setValue('');
            umProperties.confirmPass.setValue('');
            if (properties.external) {
                jQuery(umProperties.external).parents('fieldset').removeClass(layoutModule.HIDDEN_CLASS);
            } else {
                jQuery(umProperties.external).parents('fieldset').addClass(layoutModule.HIDDEN_CLASS);
            }
            this.setAssignedEntities(properties.roles);
            if (properties.enabled && properties.getNameWithTenant() != signedUser) {
                buttonManager.enable(umProperties._LOGIN_AS_USER_BUTTON);
            } else {
                buttonManager.disable(umProperties._LOGIN_AS_USER_BUTTON);
            }
            if (properties.getNameWithTenant() !== signedUser) {
                buttonManager.enable('#' + this._DELETE_BUTTON_ID);
            } else {
                buttonManager.disable('#' + this._DELETE_BUTTON_ID);
            }
        };
        orgModule.properties._deleteEntity = function () {
            orgModule.invokeClientAction('delete', { entity: this._value });
        };
        orgModule.properties._loginAsUser = function () {
            orgModule.invokeUserManagerAction('login', { user: this._value });
        };
        orgModule.properties._editEntity = function () {
            var umProperties = orgModule.userManager.properties;    //hide/show the password in case of an external user.
            //hide/show the password in case of an external user.
            if (this._value.external) {
                jQuery(umProperties.PASSWORD_PATTERN).parent().addClass(layoutModule.HIDDEN_CLASS);
                jQuery(umProperties.PASSWORD_CONFIRM_PATTERN).parent().addClass(layoutModule.HIDDEN_CLASS);
            } else {
                jQuery(umProperties.PASSWORD_PATTERN).parent().removeClass(layoutModule.HIDDEN_CLASS);
                jQuery(umProperties.PASSWORD_CONFIRM_PATTERN).parent().removeClass(layoutModule.HIDDEN_CLASS);
            }    //reset password fields
            //reset password fields
            jQuery(umProperties.PASSWORD_PATTERN).val('');
            jQuery(umProperties.PASSWORD_CONFIRM_PATTERN).val('');
            this.resetValidation([
                umProperties.USER_NAME_PATTERN,
                umProperties.EMAIL_PATTERN,
                umProperties.PASSWORD_CONFIRM_PATTERN
            ]);
            this.changeReadonly(true, [
                umProperties.USER_NAME_PATTERN,
                umProperties.EMAIL_PATTERN
            ]);
            var disabled = this._value.getNameWithTenant() !== signedUser;
            this.changeDisable(disabled, [umProperties.ENABLE_USER_PATTERN]);
        };
        orgModule.properties._showEntity = function () {
            var umProperties = orgModule.userManager.properties;
            this.resetValidation([
                umProperties.USER_NAME_PATTERN,
                umProperties.EMAIL_PATTERN,
                umProperties.PASSWORD_CONFIRM_PATTERN
            ]);
            this.changeReadonly(false, [
                umProperties.USER_NAME_PATTERN,
                umProperties.EMAIL_PATTERN
            ]);
            this.changeDisable(false, [umProperties.ENABLE_USER_PATTERN]);
        };
        orgModule.properties.validate = function () {
            var umProperties = orgModule.userManager.properties;
            if (ValidationModule.validateLegacy(umProperties._validators)) {
                return true;
            } else {
                dialogs.systemConfirm.show(orgModule.messages['validationErrors'], 2000);
                return false;
            }
        };
        orgModule.properties.isChanged = function () {
            var umProperties = orgModule.userManager.properties;
            var oldUser = this._value;
            var user = umProperties._toUser();
            var attributesFacade = orgModule.properties.attributesFacade, isAttributesChanged = attributesFacade && attributesFacade.containsUnsavedItems();
            return this.isEditMode && (isAttributesChanged || oldUser.fullName != user.fullName || oldUser.email != user.email || oldUser.enabled != user.enabled || oldUser.password != user.password || oldUser.confirmPassword != user.confirmPassword || this.getAssignedEntities().length > 0 || this.getUnassignedEntities().length > 0);
        };
        orgModule.properties.save = function () {
            var umProperties = orgModule.userManager.properties;
            var orgModuleProps = this;
            umProperties._toUser(function (encryptedUser, unencryptedUIUser) {
                if (orgModuleProps._value.tenantId) {
                    encryptedUser.tenantId = orgModuleProps._value.tenantId;
                    unencryptedUIUser.tenantId = orgModuleProps._value.tenantId;
                }
                encryptedUser.roles = orgModuleProps.getAssignedEntities();
                unencryptedUIUser.roles = orgModuleProps.getAssignedEntities();
                orgModule.invokeServerAction('update', {
                    entityName: orgModuleProps._value.getNameWithTenant(),
                    entity: encryptedUser,
                    unencryptedEntity: unencryptedUIUser,
                    assigned: orgModuleProps.getAssignedEntities(),
                    unassigned: orgModuleProps.getUnassignedEntities()
                });
                orgModule.properties.changeMode(false);
            });
        };
        orgModule.properties.cancel = function () {
            var dfd = new jQuery.Deferred();
            this.setProperties(this._value);
            return this.attributesFacade ? this.attributesFacade.cancel() : dfd.resolve();
        };
    },
    _initCustomEvents: function (roles) {
        var panel = jQuery('#' + orgModule.properties._id), $activeElements = jQuery('#moveButtons, #userEnable'), $availableAndAssignedEl = jQuery('#editRoles').find('#assigned, #available');
        this.id.regExp = new RegExp(orgModule.Configuration.userNameNotSupportedSymbols);
        this.id.unsupportedSymbols = new RegExpRepresenter(orgModule.Configuration.userNameNotSupportedSymbols).getRepresentedString();
        panel.on('keyup', function (event) {
            var input = event.target;
            input.inputValidator && ValidationModule.validateLegacy(input.inputValidator);
            if (input == this.id) {
                ValidationModule.validateLegacy([orgModule.createInputRegExValidator(input)]);
                event.stopPropagation();
            }
            orgModule.properties._toggleButton();
        }.bind(this));
        $activeElements.on('click', function (e) {
            orgModule.properties._toggleButton();
        });
        $availableAndAssignedEl.on('dblclick', function () {
            orgModule.properties._toggleButton();
        });
        jQuery(this.email).on('blur', function (event) {
            var input = event.target;
            if (input.blurValidator) {
                if (ValidationModule.validateLegacy(input.blurValidator)) {
                    input.inputValidator && (input.inputValidator = null);
                } else {
                    input.inputValidator = input.blurValidator;
                    input.focus();
                    return false;
                }
            }
        });
        jQuery('#' + orgModule.properties._BUTTONS_CONTAINER_ID).on('click', function (event) {
            var button = matchAny(event.target, [layoutModule.BUTTON_PATTERN], true);
            var loginAs = jQuery(this._LOGIN_AS_USER_BUTTON)[0];
            if (button == loginAs && !buttonManager.isDisabled(loginAs)) {
                orgModule.properties._loginAsUser();
            }
        }.bind(this));
    },
    _toUser: function (callbackFunc) {
        if (!callbackFunc) {
            //version without encryption
            return new orgModule.User({
                fullName: jQuery(this.name).val(),
                userName: jQuery(this.id).val(),
                email: jQuery(this.email).val(),
                enabled: this.enabled.checked,
                external: this.external.checked,
                password: jQuery(this.pass).val(),
                confirmPassword: jQuery(this.confirmPass).val()
            });
        }    //version of function with encryption from here on.
        //user used to keep most ui unencrypted on refresh
        //version of function with encryption from here on.
        //user used to keep most ui unencrypted on refresh
        var unencryptedUIUser = new orgModule.User({
            fullName: jQuery(this.name).val(),
            userName: jQuery(this.id).val(),
            email: jQuery(this.email).val(),
            enabled: this.enabled.checked,
            external: this.external.checked,
            password: '',
            confirmPassword: ''
        });
        if (window.isEncryptionOn) {
            //global property from jsp page, set up in security-config.properties
            var orgModuleUserManagerPropsObj = this;
            var paramToEncrypt = {};
            paramToEncrypt[this.pass.id] = this.pass.getValue();
            paramToEncrypt[this.confirmPass.id] = this.confirmPass.getValue();
            JSEncrypter.encryptData(paramToEncrypt, function (encData) {
                if (!encData)
                    throw new Error('No encrypted data found.');
                jQuery('#' + orgModuleUserManagerPropsObj.pass.id).val(encData[orgModuleUserManagerPropsObj.pass.id]);
                jQuery('#' + orgModuleUserManagerPropsObj.confirmPass.id).val(encData[orgModuleUserManagerPropsObj.confirmPass.id]);    //used to send encrypted data
                //used to send encrypted data
                var encryptedUser = new orgModule.User({
                    fullName: orgModuleUserManagerPropsObj.name.getValue(),
                    userName: orgModuleUserManagerPropsObj.id.getValue(),
                    email: orgModuleUserManagerPropsObj.email.getValue(),
                    enabled: orgModuleUserManagerPropsObj.enabled.checked,
                    external: orgModuleUserManagerPropsObj.external.checked,
                    password: encData[orgModuleUserManagerPropsObj.pass.id]
                });
                callbackFunc(encryptedUser, unencryptedUIUser);
            });
        } else {
            unencryptedUIUser.password = this.pass.getValue();
            callbackFunc(unencryptedUIUser, unencryptedUIUser);
        }
    }
};    ////////////////////////////////////////
// Create user dialog
////////////////////////////////////////
////////////////////////////////////////
// Create user dialog
////////////////////////////////////////
orgModule.userManager.addDialog = {
    _ADD_USER_ID: 'addUser',
    _ADD_BUTTON_ID: 'addUserBtn',
    _CANCEL_BUTTON_ID: 'cancelUserBtn',
    _FULL_NAME_ID: 'addUserFullName',
    _USER_NAME_ID: 'addUserID',
    _USER_EMAIL_ID: 'addUserEmail',
    _ENABLE_USER_ID: 'addUserEnableUser',
    _PASSWORD_ID: 'addUserPassword',
    _CONFIRM_PASSWORD_ID: 'addUserConfirmPassword',
    _ADD_BUTTON_TITLE_PATTERN: '.wrap',
    initialize: function () {
        this.addUser = jQuery('#' + this._ADD_USER_ID)[0];
        this.addBtn = jQuery('#' + this._ADD_BUTTON_ID)[0];
        this.cancelBtn = jQuery('#' + this._CANCEL_BUTTON_ID)[0];
        this.fullName = jQuery('#' + this._FULL_NAME_ID)[0];
        this.userName = jQuery('#' + this._USER_NAME_ID)[0];
        this.userEmail = jQuery('#' + this._USER_EMAIL_ID)[0];
        this.enableUser = jQuery('#' + this._ENABLE_USER_ID)[0];
        this.password = jQuery('#' + this._PASSWORD_ID)[0];
        this.confirmPassword = jQuery('#' + this._CONFIRM_PASSWORD_ID)[0];
        this.userName.regExp = new RegExp(orgModule.Configuration.userNameNotSupportedSymbols);
        this.userName.regExpForReplacement = new RegExp(orgModule.Configuration.userNameNotSupportedSymbols, 'g');
        this.userName.unsupportedSymbols = new RegExpRepresenter(orgModule.Configuration.userNameNotSupportedSymbols).getRepresentedString();
        this.userName.inputValidator = orgModule.createInputRegExValidator(this.userName);
        this.userEmail.blurValidator = orgModule.createRegExpValidator(this.userEmail, 'invalidEmail', XRegExp(orgModule.Configuration.emailRegExpPattern));
        this.password.inputValidator = orgModule.createRegExpValidator(this.password, 'passwordIsWeak', XRegExp(orgModule.Configuration.passwordPattern));
        this.confirmPassword.blurValidator = orgModule.createSameValidator(this.confirmPassword, this.password, 'invalidConfirmPassword');
        this._validators = [
            orgModule.createBlankValidator(this.userName, 'userNameIsEmpty'),
            orgModule.createBlankValidator(this.password, 'passwordIsEmpty', function (validator) {
                validator.element.inputValidator = null;
            }, function (validator) {
                validator.element.inputValidator = validator;
            }),
            this.confirmPassword.blurValidator,
            this.userEmail.blurValidator,
            this.password.inputValidator,
            this.userName.inputValidator
        ];
        this.addUser.observe('keyup', function (event) {
            var input = event.target;
            input.inputValidator && ValidationModule.validateLegacy(input.inputValidator);
            if (input == this.userName) {
                if (!input.changedByUser) {
                    input.changedByUser = input.getValue() != input.prevValue;
                }
            } else if (input == this.fullName) {
                if (!this.userName.changedByUser) {
                    if (!this.userName.regExp.test(this.fullName.getValue())) {
                        this.userName.setValue(input.getValue());
                    } else {
                        this.userName.setValue(input.getValue().replace(this.userName.regExpForReplacement, '_'));
                    }
                }
                event.stopPropagation();
            }
        }.bindAsEventListener(this));
        [
            this.userEmail,
            this.confirmPassword
        ].invoke('observe', 'blur', function (event) {
            var input = event.target;
            if (input.blurValidator) {
                if (ValidationModule.validateLegacy(input.blurValidator)) {
                    input.inputValidator && (input.inputValidator = null);
                } else {
                    input.inputValidator = input.blurValidator;    //                    input.focus();
                    //                    input.focus();
                    return false;
                }
            }
        });
        this.addUser.observe('keydown', function (event) {
            var input = event.target;
            if (this.userName == input) {
                this.userName.prevValue = this.userName.getValue();
            }
        }.bindAsEventListener(this));
        this.addUser.observe('click', function (event) {
            var button = matchAny(event.target, [layoutModule.BUTTON_PATTERN], true);
            if (button == this.addBtn) {
                this._doAdd();
            } else if (button == this.cancelBtn) {
                this.hide();
            }
        }.bindAsEventListener(this));
    },

    _hideValidationErrors: function() {
        [
            this.fullName,
            this.userName,
            this.password,
            this.confirmPassword,
            this.userEmail
        ].each(function (e) {
            ValidationModule.hideError(e, true);
            e.changedByUser = false;
        });
    },

    show: function (organization) {
        this.organization = organization;
        this._hideValidationErrors();
        var title = jQuery(this.addBtn).find(this._ADD_BUTTON_TITLE_PATTERN)[0];
        if (title) {
            var msg = (this.organization && !this.organization.isRoot()) ?
                orgModule.getMessage('addUserTo', {
                    organizationName: orgModule.truncateOrgName(this.organization.id)
                }) :
                orgModule.getMessage('addUser');

            title.update(msg);
        }

        this.addBtn.title = (this.organization && !this.organization.isRoot()) ?
            orgModule.getMessage('addUserTo', { organizationName: this.organization.id }) :
            orgModule.getMessage('addUser');

        dialogs.popup.show(this.addUser, true);
        try {
            this.fullName.focus();
        } catch (e) {
        }
    },
    hide: function () {
        dialogs.popup.hide(this.addUser);
        this.userName.setValue('');
        this.fullName.setValue('');
        this.userEmail.setValue('');
        this.enableUser.checked = true;
        this.password.setValue('');
        this.confirmPassword.setValue('');
    },
    _validate: function () {
        return ValidationModule.validateLegacy(this._validators);
    },
    _autoFill: function () {
    },
    _doAdd: function () {
        if (this._validate()) {
            var thisObj = this;
            var paramToEncrypt;
            if (window.isEncryptionOn)
            //global property from jsp page, set up in security-config.properties
                paramToEncrypt = { pswd: this.password.getValue() };
            JSEncrypter.encryptData(paramToEncrypt, function (encData) {
                var pwd = thisObj.password.getValue();
                if (encData && encData.pswd)
                    pwd = encData.pswd;
                var defaultRole = orgModule.Configuration.userDefaultRole;
                var user = new orgModule.User({
                    userName: thisObj.userName.getValue(),
                    fullName: thisObj.fullName.getValue(),
                    email: thisObj.userEmail.getValue(),
                    enabled: thisObj.enableUser.checked,
                    password: pwd,
                    roles: defaultRole ? [{ roleName: defaultRole }] : []
                });
                if (thisObj.organization && !thisObj.organization.isRoot()) {
                    user.tenantId = thisObj.organization.id;
                }
                orgModule.invokeServerAction(orgModule.ActionMap.EXIST, {
                    entity: user,
                    onExist: function () {
                        ValidationModule.showError(this.userName, orgModule.messages['userNameIsAlreadyInUse']);
                    }.bind(thisObj),
                    onNotExist: function () {
                        ValidationModule.hideError(thisObj.userName);
                        orgModule.invokeServerAction(orgModule.ActionMap.CREATE, { entity: user });
                    }.bind(thisObj)
                });
            });
        }
    }
};

export default orgModule;