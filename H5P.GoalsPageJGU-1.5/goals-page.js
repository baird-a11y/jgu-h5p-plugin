var H5P = H5P || {};

/**
 * Goals Page module
 * @external {jQuery} $ H5P.jQuery
 */
H5P.GoalsPageJGU = (function ($, EventDispatcher) {
  // CSS Classes:
  var MAIN_CONTAINER = 'h5p-goals-page';

  var goalCounter = 0;

  /**
   * Helper for resizing height of text area while typing (to avoid scrollbars)
   *
   * @param  {H5P.jQuery} $textarea
   */
  var autoResizeTextarea = function ($textarea) {
    var setHeight = function () {
      $textarea.css('height', Math.max($textarea[0].scrollHeight, 50) + 'px');
    };

    $textarea.on('input', function () {
      this.style.height = 'auto';
      setHeight();
    });

    setHeight();
  };

  /**
   * Initialize module.
   * @param {Object} params Behavior settings
   * @param {Number} id Content identification
   * @param {object} [extras] Saved state, metadata, etc.
   * @returns {Object} GoalsPageJGU GoalsPageJGU instance
   */
  function GoalsPageJGU(params, id, extras) {
    EventDispatcher.call(this);
    this.id = id;
    this.extras = extras;

    // Set default behavior.
    this.params = $.extend({
      title: this.getTitle(),
      a11yFriendlyTitle: this.getTitle(false),
      description: '',
      predefinedGoals: [],
      defineGoalText: 'Create a new goal',
      definedGoalLabel: 'User defined goal',
      defineGoalPlaceholder: 'Write here...',
      goalsAddedText: 'Number of goals added:',
      removeGoalText: 'Remove Goal',
      helpTextLabel: 'Read more',
      helpText: 'Help text',
      goalDeletionConfirmation: {
        header: 'Confirm deletion',
        message: 'Are you sure you want to delete this goal?',
        cancelLabel: 'Cancel',
        confirmLabel: 'Confirm'
      },
      l10n: {
        weight: 'Weight'
      }
    }, params);

    if (extras !== undefined && extras.previousState !== null && typeof extras.previousState === 'object' && Object.keys(extras.previousState).length) {
      this.previousState = extras.previousState;
    }
  }

  GoalsPageJGU.prototype = Object.create(EventDispatcher.prototype);
  GoalsPageJGU.prototype.constructor = GoalsPageJGU;

  /**
   * Attach function called by H5P framework to insert H5P content into page.
   *
   * @param {jQuery} $container The container which will be appended to.
   */
  GoalsPageJGU.prototype.attach = function ($container) {
    var self = this;
    this.$inner = $('<div>', {
      'class': MAIN_CONTAINER
    }).appendTo($container);

    self.goalList = [];
    self.goalId = 0;

    self.$pageTitle = $('<li>', {
      class: 'page-header',
      role: 'heading',
      tabindex: '-1',
      'aria-label': self.params.a11yFriendlyTitle,
      append: $('<div>', {
        class: 'page-title',
        html: self.params.title
      }),
      appendTo: self.$inner
    });

    if (self.params.helpText !== undefined && self.params.helpText.length !== 0) {
      self.$helpButton = $('<button>', {
        'class': 'page-help-text',
        html: self.params.helpTextLabel,
        click: function () {
          self.trigger('open-help-dialog', {
            title: self.params.title,
            helpText: self.params.helpText
          });
        },
        appendTo: self.$pageTitle
      });
    }

    $('<div>', {
      class: 'goals-description',
      html: self.params.description,
      appendTo: self.$inner
    });

    self.$goalsView = $('<div>', {
      class: 'goals-view',
      appendTo: self.$inner
    });

    $('<div>', {
      class: 'goals-counter',
      appendTo: self.$inner
    });

    const $goalsDefine = $('<div>', {
      class: 'goals-define',
      appendTo: self.$inner
    });

    self.$createGoalButton = $('<div>', {
      role: 'button',
      tabindex: '0',
      class: 'joubel-simple-rounded-button goals-create',
      title: self.params.defineGoalText,
      append: $('<span>', {
        class: 'joubel-simple-rounded-button-text',
        html: self.params.defineGoalText
      }),
      appendTo: $goalsDefine
    });

    if (this.previousState && this.previousState.goals) {
      // Recreate goals
      this.previousState.goals.forEach(function (goal, index) {
        self.addGoal({
          value: goal.text,
          description: goal.goalTypeDescription,
          weight: goal.weight
        });
        self.goalList[index].goalAnswer(goal.answer);
        self.goalList[index].setTextualAnswer(goal.textualAnswer);
        self.goalList[index].setComment(goal.comment);
      });
    }

    // Attach button click event listener
    self.initCreateGoalButton();

    if (!this.previousState) {
      self.addPredefinedGoals();
    }
  };

  /**
   * Create button for creating goals
   */
  GoalsPageJGU.prototype.initCreateGoalButton = function () {
    var self = this;

    // Create new goal on click
    H5P.DocumentationToolJGU.handleButtonClick(self.$createGoalButton, function () {
      self.addGoal().find('.created-goal').focus();
      self.trigger('resize');
    });
  };

  /**
   * Add predefined goals to the page.
   */
  GoalsPageJGU.prototype.addPredefinedGoals = function() {
    const self = this;

    self.params.predefinedGoals.forEach((goal) => {
      if (!goal.text) {
        return;
      }
      self.addGoal({
        value: self.htmlDecode(goal.text),
        description: self.htmlDecode(self.params.definedGoalLabel),
        weight: goal.weight
      });
    });
  };

  /**
   * Adds a new goal to the page
   * @param {Object} competenceAim Optional competence aim which the goal will constructed from
   * @return {jQuery} $newGoal New goal element
   */
  GoalsPageJGU.prototype.addGoal = function (competenceAim) {
    var self = this;
    goalCounter++;

    var goalPlaceholder = this.htmlDecode(self.params.defineGoalPlaceholder);
    var goalTypeDescription = this.htmlDecode(self.params.definedGoalLabel);
    let goalText = undefined;

    const goalWeight = competenceAim?.weight ?? 100;

    // Use predefined goal
    if (competenceAim !== undefined) {
      goalText = competenceAim.value;
      goalTypeDescription = competenceAim.description;
    }

    var newGoal = new H5P.GoalsPageJGU.GoalInstance(
      goalPlaceholder, self.goalId, goalTypeDescription, goalText, goalWeight
    );
    self.goalList.push(newGoal);
    self.goalId += 1;

    // Create goal element and append it to view
    var $newGoal = this.createNewGoal(newGoal).appendTo(self.$goalsView);

    self.updateGoalsCounter();

    return $newGoal;
  };

  /**
   * Remove chosen goal from the page
   * @param {jQuery} $goalContainer
   */
  GoalsPageJGU.prototype.removeGoal = function ($goalContainer) {
    var goalInstance = this.getGoalInstanceFromUniqueId($goalContainer.data('uniqueId'));

    if (this.goalList.indexOf(goalInstance) > -1) {
      this.goalList.splice(this.goalList.indexOf(goalInstance), 1);
    }
    $goalContainer.remove();
    this.updateGoalsCounter();
    this.trigger('resize');
  };

  /**
   * Updates goal counter on page with amount of chosen goals.
   */
  GoalsPageJGU.prototype.updateGoalsCounter = function () {
    var self = this;
    var $goalCounterContainer = $('.goals-counter', self.$inner);
    $goalCounterContainer.children().remove();
    if (self.goalList.length) {
      $('<span>', {
        'class': 'goals-counter-text',
        'html': self.params.goalsAddedText + ' ' + self.goalList.length,
        'aria-live': 'polite'
      }).appendTo($goalCounterContainer);
    }
  };

  /**
   * Returns the goal instance matching provided id
   * @param {Number} goalInstanceUniqueId Id matching unique id of target goal
   * @returns {H5P.GoalsPageJGU.GoalInstance|Number} Returns matching goal instance or -1 if not found
   */
  GoalsPageJGU.prototype.getGoalInstanceFromUniqueId = function (goalInstanceUniqueId) {
    var foundInstance = -1;
    this.goalList.forEach(function (goalInstance) {
      if (goalInstance.getUniqueId() === goalInstanceUniqueId) {
        foundInstance = goalInstance;
      }
    });

    return foundInstance;
  };

  /**
   * Create a new goal container
   * @param {H5P.GoalsPageJGU.GoalInstance} goalInstance Goal instance object to create the goal from
   * @returns {jQuery} New goal element
   */
  GoalsPageJGU.prototype.createNewGoal = function (goalInstance) {
    var self = this;

    // Goal container
    var $goalContainer = $('<div/>', {
      'class': 'created-goal-container',
    }).data('uniqueId', goalInstance.getUniqueId());

    var id = 'created-goal-' + goalCounter + '-' + goalInstance.getUniqueId();

    // Input paragraph area
    var $goalInputArea = $('<textarea>', {
      'class': 'created-goal',
      'spellcheck': 'false',
      'placeholder': goalInstance.getGoalPlaceholder(),
      'text': goalInstance.goalText(),
      'title': goalInstance.getGoalTypeDescription(),
      'id': id
    }).appendTo($goalContainer);

    const weightInputWrapper = document.createElement('div');
    weightInputWrapper.classList.add('goal-weight-wrapper');

    const weightInputUuid = H5P.createUUID();
    const weightInputLabel = document.createElement('label');
    weightInputLabel.classList.add('goal-weight-label');
    weightInputLabel.setAttribute('for', weightInputUuid);
    weightInputLabel.innerHTML = this.params.l10n.weight;
    weightInputWrapper.append(weightInputLabel);

    const weightInput = document.createElement('input');
    weightInput.classList.add('goal-weight');
    weightInput.setAttribute('id', weightInputUuid);
    weightInput.setAttribute('type', 'number');
    weightInput.setAttribute('pattern', '\d*');
    weightInput.setAttribute('min', '0');
    weightInput.setAttribute('value', goalInstance.getWeight());
    weightInputWrapper.append(weightInput);

    $goalContainer.append(weightInputWrapper);

    weightInput.addEventListener('input', () => {
      goalInstance.setWeight(weightInput.value);
    });

    // Need to tell world I might need to resize
    $goalInputArea.on('blur keyup paste input', function () {
      self.trigger('resize');
    });

    // Save the value
    $goalInputArea.on('blur', function () {
      goalInstance.goalText($goalInputArea.val());
      var xAPIEvent = self.createXAPIEventTemplate('interacted');
      self.addQuestionToxAPI(xAPIEvent);
      self.addResponseToxAPI(xAPIEvent);
      self.trigger(xAPIEvent);
    });

    autoResizeTextarea($goalInputArea);

    // Add remove button
    this.createRemoveGoalButton(this.params.removeGoalText, id, $goalContainer).appendTo($goalContainer);

    return $goalContainer;
  };

  /**
   * Creates a button for removing the given container
   * @param {String} text String to display on the button
   * @param {jQuery} $removeContainer Container that will be removed upon click
   * @returns {jQuery} $removeGoalButton The button
   */
  GoalsPageJGU.prototype.createRemoveGoalButton = function (text, textAreaId, $removeContainer) {
    var self = this;
    var $removeGoalButton = $('<button>', {
      'class': 'h5p-created-goal-remove h5p-goals-button',
      'title': text,
      click: function () {
        var confirmationDialog = new H5P.ConfirmationDialog({
          headerText: self.params.goalDeletionConfirmation.header,
          dialogText: self.params.goalDeletionConfirmation.message,
          cancelText: self.params.goalDeletionConfirmation.cancelLabel,
          confirmText: self.params.goalDeletionConfirmation.confirmLabel
        });

        confirmationDialog.on('confirmed', function () {
          self.removeGoal($removeContainer);
          // Set focus to add new goal button
          self.$createGoalButton.focus();
        });

        confirmationDialog.appendTo(self.$inner.closest('.h5p-documentation-tool').get(0));
        confirmationDialog.show();
      }
    });

    return $removeGoalButton;
  };

  /**
   * Get page title
   * @param {boolean} turncatedTitle turncate title flag
   * @returns {String} Page title
   */
  GoalsPageJGU.prototype.getTitle = function (turncatedTitle = true) {
    const pageTitle = (this.extras && this.extras.metadata && this.extras.metadata.title) ? this.extras.metadata.title : 'Goals';
    return turncatedTitle ? H5P.createTitle(pageTitle) : pageTitle;
  };

  /**
   * Get goal list
   * @returns {Array} Goal list
   */
  GoalsPageJGU.prototype.getGoals = function () {
    return this.goalList;
  };

  /**
   * Sets focus on page
   */
  GoalsPageJGU.prototype.focus = function () {
    this.$pageTitle.focus();
  };

  /**
   * Get xAPI data.
   * Contract used by report rendering engine.
   *
   * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-6}
   */
  GoalsPageJGU.prototype.getXAPIData = function () {
    var XAPIEvent = this.createXAPIEventTemplate('answered');
    this.addQuestionToxAPI(XAPIEvent);
    this.addResponseToxAPI(XAPIEvent);
    return {
      statement: XAPIEvent.data.statement
    };
  };

  /**
    * Trigger xAPI answered event
    */
  GoalsPageJGU.prototype.triggerAnswered = function () {
    var xAPIEvent = this.createXAPIEventTemplate('answered');
    this.addQuestionToXAPI(xAPIEvent);
    this.addResponseToXAPI(xAPIEvent);
    this.trigger(xAPIEvent);
  };

  /**
   * Add the question itself to the definition part of an xAPIEvent
   */
  GoalsPageJGU.prototype.addQuestionToxAPI = function (xAPIEvent) {
    var definition = xAPIEvent.getVerifiedStatementValue(['object', 'definition']);
    $.extend(definition, this.getxAPIDefinition());
  };

  /**
   * Generate xAPI object definition used in xAPI statements.
   * @return {Object}
   */
  GoalsPageJGU.prototype.getxAPIDefinition = function () {
    var definition = {};
    var self = this;
    definition.description = {
      'en-US': self.params.definedGoalLabel
    };
    definition.type = 'http://adlnet.gov/expapi/activities/cmi.interaction';
    definition.interactionType = 'fill-in';
    definition.correctResponsesPattern = [];
    definition.extensions = {
      'https://h5p.org/x-api/h5p-machine-name': 'H5P.GoalsPageJGU'
    };

    return definition;
  };

  /**
   * Add the response part to an xAPI event
   *
   * @param {H5P.XAPIEvent} xAPIEvent
   *  The xAPI event we will add a response to
   */
  GoalsPageJGU.prototype.addResponseToxAPI = function (xAPIEvent) {
    xAPIEvent.data.statement.result = {};
    xAPIEvent.data.statement.result.response = this.getXAPIResponse();
  };

  /**
   * Generate xAPI user response, used in xAPI statements.
   * @return {string} User answers separated by the "[,]" pattern
   */
  GoalsPageJGU.prototype.getXAPIResponse = function () {
    return this.getGoals().map(function (goal) {
      return goal.text;
    }).join('[,]');
  };

  /**
   * Retrieve true string from HTML encoded string.
   * @param {string} input Input string.
   * @return {string} Output string.
   */
  GoalsPageJGU.prototype.htmlDecode = function (input) {
    const dparser = new DOMParser().parseFromString(input, 'text/html');
    const div = document.createElement('div');
    div.innerHTML = dparser.documentElement.textContent;

    return div.textContent || div.innerText || '';
  };

  /**
   * Answer call to return the current state.
   * @return {object} Current state.
   */
  GoalsPageJGU.prototype.getCurrentState = function () {
    const goals = this.goalList.map(function (instance) {
      return (typeof instance.getCurrentState === 'function') ?
        instance.getCurrentState() :
        undefined;
    });

    return {
      goals: goals
    };
  };

  GoalsPageJGU.prototype.resetTask = function () {
    const self = this;

    $(this.$goalsView).find('.created-goal-container').each(function () {
      self.removeGoal($(this));
    });

    self.addPredefinedGoals();
  };

  return GoalsPageJGU;
}(H5P.jQuery, H5P.EventDispatcher));
