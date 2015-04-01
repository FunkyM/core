
/**
 * Copyright (c) 2015, Arthur Schiwon <blizzz@owncloud.com>
 * This file is licensed under the Affero General Public License version 3 or later.
 * See the COPYING-README file.
 */

OCA = OCA || {};

(function() {

	/**
	 * @classdesc An abstract tab view
	 * @abstract
	 */
	var WizardTabGeneric = OCA.LDAP.Wizard.WizardObject.subClass({
		/** @inheritdoc */
		init: function(tabIndex, tabID) {
			this.tabIndex = tabIndex;
			this.tabID = tabID;
			this.spinner = $('.ldapSpinner').first().clone().removeClass('hidden');
			_.bindAll(this, '_toggleRawFilterMode', '_toggleRawFilterModeConfirmation');
		},

		/**
		 * sets the configuration items that are managed by that view.
		 *
		 * The parameter contains key-value pairs the key being the
		 * configuration keys and the value being its setter method.
		 *
		 * @param {object} managedItems
		 */
		setManagedItems: function(managedItems) {
			this.managedItems = managedItems;
			this._enableAutoSave();
		},

		/**
		 * Sets the config model. The concrete view likely wants to subscribe
		 * to events as well.
		 *
		 * @param {OCA.LDAP.Wizard.ConfigModel} configModel
		 */
		setModel: function(configModel) {
			this.configModel = configModel;
			this.parsedFilterMode = this.configModel.FILTER_MODE_ASSISTED;
			this.configModel.on('detectionStarted', this.onDetectionStarted, this);
			this.configModel.on('detectionCompleted', this.onDetectionCompleted, this);
			this.configModel.on('serverError', this.onServerError, this);
		},

		/**
		 * the method can be used to display a different error/information
		 * message than provided by the ownCloud server response. The concrete
		 * Tab View may optionally implement it. Returning an empty string will
		 * avoid any notification.
		 *
		 * @param {string} message
		 * @param {string} key
		 * @returns {string}
		 */
		overrideErrorMessage: function(message, key) {
			return message;
		},

		/**
		 * this is called by the main view, if the tab is being switched to.
		 * The concrete tab view can implement this if necessary.
		 */
		onActivate: function() { },

		/**
		 * displays server error messages.
		 *
		 * @param view
		 * @param payload
		 */
		onServerError: function(view, payload) {
			if (   !_.isUndefined(view.managedItems[payload.relatedKey])) {
				var message = view.overrideErrorMessage(payload.message, payload.relatedKey);
				if(message.length > 0) {
					OC.Notification.showTemporary(message);
				}
			}
		},

		/**
		 * disables affected, managed fields if a detector is running against them
		 *
		 * @param {WizardTabGeneric} view
		 * @param {string} key
		 */
		onDetectionStarted: function(view, key) {
			if(!_.isUndefined(view.managedItems[key])) {
				view.disableElement(view.managedItems[key].$element);
				if(!_.isUndefined(view.managedItems[key].$relatedElements)){
					view.disableElement(view.managedItems[key].$relatedElements);
				}
				view.attachSpinner(view.managedItems[key].$element.attr('id'));
			}
		},

		/**
		 * enables affected, managed fields after a detector was run against them
		 *
		 * @param {WizardTabGeneric} view
		 * @param {string} key
		 */
		onDetectionCompleted: function(view, key) {
			if(!_.isUndefined(view.managedItems[key])) {
				view.enableElement(view.managedItems[key].$element);
				if(!_.isUndefined(view.managedItems[key].$relatedElements)){
					view.enableElement(view.managedItems[key].$relatedElements);
				}
				view.removeSpinner(view.managedItems[key].$element.attr('id'));
			}
		},

		/**
		 * sets the value to an HTML element. Checkboxes, text areas and (text)
		 * input fields are supported.
		 *
		 * @param {jQuery} $element - the target element
		 * @param {string|number} value
		 */
		setElementValue: function($element, value) {
			// deal with check box
			if ($element.is('input[type=checkbox]')) {
				this._setCheckBox($element, value);
				return;
			}

			// deal with text area
			if ($element.is('textarea') && $.isArray(value)) {
				value = value.join("\n");
			}

			if ($element.is('span')) {
				$element.text(value);
			} else {
				$element.val(value);
			}
		},

		/**
		 * replaces options on a multiselect element
		 *
		 * @param {jQuery} $element - the multiselect element
		 * @param {Array} options
		 */
		equipMultiSelect: function($element, options) {
			$element.find('option').remove();
			for (var i in options) {
				var name = options[i];
				var entry = "<option value='" + name + "'>" + name + "</option>";
				$element.append(entry);
			}
			$element.multiselect('refresh');
		},

		/**
		 * enables the specified HTML element
		 *
		 * @param {jQuery} $element
		 */
		enableElement: function($element) {
			if($element.is('select[multiple]') && $element.find('option').length > 0) {
				$element.multiselect("enable");
			} else {
				$element.prop('disabled', false);
			}
		},

		/**
		 * disables the specified HTML element
		 *
		 * @param {jQuery} $element
		 */
		disableElement: function($element) {
			if($element.is('select[multiple]')) {
				$element.multiselect("disable");
			} else {
				$element.prop('disabled', 'disabled');
			}
		},

		/**
		 * attaches a spinner icon to the HTML element specified by ID
		 *
		 * @param {string} elementID
		 */
		attachSpinner: function(elementID) {
			if($('#' + elementID + ' + .ldapSpinner').length == 0) {
				var spinner = this.spinner.clone();
				var $element = $('#' + elementID);
				$(spinner).insertAfter($element);
				// and special treatment for multiselects:
				if ($element.is('select[multiple]')) {
					$('#' + elementID + " + img + button").css('display', 'none');
				}
			}
		},

		/**
		 * removes the spinner icon from the HTML element specified by ID
		 *
		 * @param {string} elementID
		 */
		removeSpinner: function(elementID) {
			$('#' + elementID+' + .ldapSpinner').remove();
			// and special treatment for multiselects:
			$('#' + elementID + " + button").css('display', 'inline');
		},

		/**
		 * whether the wizard works in experienced admin mode
		 *
		 * @returns {boolean}
		 */
		isExperiencedMode: function() {
			return parseInt(this.configModel.configuration.ldap_experienced_admin, 10) === 1;
		},

		/**
		 * sets up auto-save functionality to the managed items
		 *
		 * @private
		 */
		_enableAutoSave: function() {
			var view = this;

			for(var id in this.managedItems) {
				if(_.isUndefined(this.managedItems[id].$element)
				   || _.isUndefined(this.managedItems[id].setMethod)) {
					continue;
				}
				var $element = this.managedItems[id].$element;
				if (!$element.is('select[multiple]')) {
					$element.change(function() {
						view._requestSave($(this));
					});
				}
			}
		},

		/**
		 * initializes a multiSelect element
		 *
		 * @param {jQuery} $element
		 * @param {string} caption
		 * @private
		 */
		_initMultiSelect: function($element, caption) {
			var view = this;
			$element.multiselect({
				header: false,
				selectedList: 9,
				noneSelectedText: caption,
				close: function() {
					view._requestSave($element);
				}
			});
		},

		/**
		 * @typedef {object} viewSaveInfo
		 * @property {function} val
		 * @property {function} attr
		 * @property {function} is
		 */

		/**
		 * requests a save operation from the model for a given value
		 * represented by a HTML element and its ID.
		 *
		 * @param {jQuery|viewSaveInfo} $element
		 * @private
		 */
		_requestSave: function($element) {
			var value = '';
			if($element.is('input[type=checkbox]')
				&& !$element.is(':checked')) {
				value = 0;
			} else if ($element.is('select[multiple]')) {
				var entries = $element.multiselect("getChecked");
				for(var i = 0; i < entries.length; i++) {
					value = value + "\n" + entries[i].value;
				}
				value = $.trim(value);
			} else {
				value = $element.val();
			}
			console.log('attempt to set ' + $element.attr('id') + ' to ' + value);
			this.configModel.set($element.attr('id'), value);
			//TODO react on if set returned false
		},

		/**
		 * updates a checkbox element according to the provided value
		 *
		 * @param {jQuery} $element
		 * @param {string|number} value
		 * @private
		 */
		_setCheckBox: function($element, value) {
			if(parseInt(value, 10) === 1) {
				$element.attr('checked', 'checked');
			} else {
				$element.removeAttr('checked');
			}
		},

		/**
		 * sets the filter mode according to the provided configuration value
		 *
		 * @param {string} mode
		 */
		setFilterMode: function(mode) {
			if(parseInt(mode, 10) === this.configModel.FILTER_MODE_ASSISTED) {
				this.parsedFilterMode = this.configModel.FILTER_MODE_ASSISTED;
				this._setFilterModeAssisted();
			} else {
				this._setFilterModeRaw();
				this.parsedFilterMode = this.configModel.FILTER_MODE_RAW;
			}
		},

		/**
		 * updates the UI so that it represents the assisted mode setting
		 *
		 * @private
		 */
		_setFilterModeAssisted: function() {
			var view = this;
			this.$filterModeRawContainer.addClass('invisible');
			var filter = this.$filterModeRawContainer.find('.ldapFilterInputElement').val();
			this.$filterModeRawContainer.siblings('.ldapReadOnlyFilterContainer').find('.ldapFilterReadOnlyElement').text(filter);
			this.$filterModeRawContainer.siblings('.ldapReadOnlyFilterContainer').removeClass('hidden');
			$.each(this.filterModeDisableableElements, function(i, $element) {
				view.enableElement($element);
			});
			if(!_.isUndefined(this.filterModeStateElement)) {
				if (this.filterModeStateElement.status === 'enabled') {
					this.enableElement(this.filterModeStateElement.$element);
				} else {
					this.filterModeStateElement.status = 'disabled';
				}
			}
		},

		/**
		 * updates the UI so that it represents the raw mode setting
		 *
		 * @private
		 */
		_setFilterModeRaw: function() {
			var view = this;
			this.$filterModeRawContainer.removeClass('invisible');
			this.$filterModeRawContainer.siblings('.ldapReadOnlyFilterContainer').addClass('hidden');
			$.each(this.filterModeDisableableElements, function (i, $element) {
				view.disableElement($element);
			});

			if(!_.isUndefined(this.filterModeStateElement)) {
				if(this.filterModeStateElement.$element.multiselect().attr('disabled') === 'disabled') {
					this.filterModeStateElement.status = 'disabled';
				} else {
					this.filterModeStateElement.status = 'enabled';
				}
			}
			if(!_.isUndefined(this.filterModeStateElement)) {
				this.disableElement(this.filterModeStateElement.$element);
			}
		},

		/**
		 * @callback toggleConfirmCallback
		 * @param {boolean} isConfirmed
		 */

		/**
		 * shows a confirmation dialogue before switching from raw to assisted
		 * mode if experienced mode is enabled.
		 *
		 * @param {toggleConfirmCallback} toggleFnc
		 * @private
		 */
		_toggleRawFilterModeConfirmation: function(toggleFnc) {
			if( !this.isExperiencedMode()
				|| this.parsedFilterMode === this.configModel.FILTER_MODE_ASSISTED
			) {
				toggleFnc(true);
			} else {
				OCdialogs.confirm(
					t('user_ldap', 'Switching the mode will enable automatic LDAP queries. Depending on your LDAP size they may take a while. Do you still want to switch the mode?'),
					t('user_ldap', 'Mode switch'),
					toggleFnc
				);
			}
		},

		/**
		 * toggles the visibility of a raw filter container and so also the
		 * state of the multi-select controls. The model is requested to save
		 * the state.
		 */
		_toggleRawFilterMode: function() {
			var view = this;
			this._toggleRawFilterModeConfirmation(function(isConfirmed) {
				if(!isConfirmed) {
					return;
				}
				/** var {number} */
				var mode;
				console.log(view.parsedFilterMode);
				if (view.parsedFilterMode === view.configModel.FILTER_MODE_ASSISTED) {
					mode = view.configModel.FILTER_MODE_RAW;
				} else {
					mode = view.configModel.FILTER_MODE_ASSISTED;
				}
				view.setFilterMode(mode);
				/** @var {viewSaveInfo} */
				var saveInfo = {
					val: function () {
						return mode;
					},
					attr: function () {
						return view.filterModeKey;
					},
					is: function () {
						return false;
					}
				};
				view._requestSave(saveInfo);
				//TODO: use ldapFilter.setMode()
			});
		},

		/**
		 * @typedef {object} filterModeStateElementObj
		 * @property {string} status - either "enabled" or "disabled"
		 * @property {jQuery} $element
		 */

		/**
		 * initializes a raw filter mode switcher
		 *
		 * @param {jQuery} $switcher - the element receiving the click
		 * @param {jQuery} $filterModeRawContainer - contains the raw filter
		 * input elements
		 * @param {jQuery[]} filterModeDisableableElements - an array of elements
		 * not belonging to the raw filter part that shall be en/disabled.
		 * @param {string} filterModeKey - the setting key that save the state
		 * of the mode
		 * @param {filterModeStateElementObj} [filterModeStateElement] - one element
		 * which status (enabled or not) is tracked by a setting
		 * @private
		 */
		_initFilterModeSwitcher: function(
			$switcher,
			$filterModeRawContainer,
			filterModeDisableableElements,
			filterModeKey,
			filterModeStateElement
		) {
			this.$filterModeRawContainer = $filterModeRawContainer;
			this.filterModeDisableableElements = filterModeDisableableElements;
			this.filterModeStateElement = filterModeStateElement;
			this.filterModeKey = filterModeKey;
			$switcher.click(this._toggleRawFilterMode);
		}

	});

	OCA.LDAP.Wizard.WizardTabGeneric = WizardTabGeneric;
})();
