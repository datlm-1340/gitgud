const TITLE = "title";
const BRANCH = "branch";

function MetaService(element) {
  this.element = element;
}

MetaService.prototype.reviewMeta = function (checklist ,edited) {
  var repositoryKey = window.location.href.split("/")[4];
  if (!checklist[repositoryKey]) return;

  var checklistData = JSON.parse(checklist[repositoryKey]).checklist
  if (!checklistData) return;

  var titleChecklist = checklistData.filter(function (item) {
    return item.type === TITLE
  });

  if (titleChecklist) reviewTitle(titleChecklist);

  var branchChecklist = checklistData.filter(function (item) {
    return item.type === BRANCH
  });
  if (branchChecklist) reviewBranch(branchChecklist);
};


function reviewTitle(titleChecklist) {
  var warnings = [];
  var title = $("h1.gh-header-title .js-issue-title").text();

  titleChecklist.forEach(function (item, i) {
    if(!isMatch(title, item)) warnings.push(item);
  });

  if (!warnings.length) return;

  var message = warnings.map(function (item) {
    return '<p>' + item.note + '</p>';
  }).join("");

  showTitleWarning(message);
}

function reviewBranch(branchChecklist) {
  var warnings = [];
  var branch = $(".gh-header-meta span.head-ref .css-truncate-target:nth-child(2)").text();

  branchChecklist.forEach(function (item, i) {
    if(!isMatch(branch, item)) warnings.push(item);
  });

  if (!warnings.length) return;

  var message = warnings.map(function (item) {
    return '<p>' + item.note + '</p>';
  }).join("");

  showBranchWarning(message);
}

function isMatch(str, item) {
  if (item.regex == 1) {
    try {
      return str.match(new RegExp(item.pattern));
    } catch (e) {
      console.error('Regex syntax error: ' + item.pattern);
      return false;
    }
  }
  return str.includes(item.pattern);
}

function showTitleWarning(message) {
  var titleWarning =  '<span id="title-warning" class="branch-action-item-icon completeness-indicator completeness-indicator-error" style="margin-right: 0.5rem; margin-top: 6px; margin-left: 0px;">' +
                        '<svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-x">' +
                          '<path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z"></path>' +
                        '</svg>' +
                        '<span class="gitgud-tooltip-content"><p>' + message + '</p></span>' +
                      '</span>';
  $(".gh-header-title").prepend(titleWarning);
}

function showBranchWarning(message) {
  var branchWarning =  '<span class="gitgud-tooltip-content"><p>' + message + '</p></span>'
  $(".gh-header-meta span.head-ref .css-truncate-target:nth-child(2)").css('color', '#da3633').append(branchWarning);
}
