/** @namespace H5PUpgrades */
var H5PUpgrades = H5PUpgrades || {};

H5PUpgrades['H5P.GoalsAssessmentPageJGU'] = (function () {
  return {
    1: {
      4: function (parameters, finished, extras) {
        var title;

        if (parameters) {
          title = parameters.title;
        }

        extras = extras || {};
        extras.metadata = extras.metadata || {};
        extras.metadata.title = (title) ? title.replace(/<[^>]*>?/g, '') : ((extras.metadata.title) ? extras.metadata.title : 'Goals Assessment Page');

        finished(null, parameters, extras);
      },
      /**
       * Upgrade von 1.4 auf 1.5
       * Fügt die neuen Parameter für das Vergleichsfeedback hinzu
       */
      5: function (parameters, finished, extras) {
        if (parameters) {
          // Standard-Wert für allowsReferenceFeedback hinzufügen
          if (parameters.allowsReferenceFeedback === undefined) {
            parameters.allowsReferenceFeedback = false;
          }
          
          // Standard-Wert für referenceFeedbackHeader hinzufügen
          if (parameters.referenceFeedbackHeader === undefined) {
            parameters.referenceFeedbackHeader = 'Reference feedback';
          }
          
          // Standard-Wert für l10n.referenceFeedback hinzufügen
          if (parameters.l10n) {
            if (parameters.l10n.referenceFeedback === undefined) {
              parameters.l10n.referenceFeedback = 'Reference feedback:';
            }
          } else {
            parameters.l10n = {
              averageScore: parameters.l10n?.averageScore || 'Average score: @score',
              referenceFeedback: 'Reference feedback:'
            };
          }
        }

        finished(null, parameters, extras);
      }
    }
  };
})();