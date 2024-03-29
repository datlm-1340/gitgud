function AppInteractionService(toolBarHeight, hotKeysService, main) {
  this.toolBarHeight = toolBarHeight;
  this.currentFileId = null;
  this.currentCommentId = null;
  this.files = this.getFiles();
  this.hotKeysService = hotKeysService;
  this.main = main;
}

AppInteractionService.prototype.attachFolderCollapseBehavior = function (
  element
) {
  $(element)
    .find(".folder")
    .click(function () {
      $header = $(this);
      $content = $header.next();
      $content.slideToggle(10, function () {
        $header.toggleClass("collapsed");
      });
    });
};

AppInteractionService.prototype.attachJumpOnClickBehavior = function (element) {
  var that = this;

  $(element)
    .find(".jk-file")
    .click(function () {
      that.scrollTo($("#" + $(this).data("file-id")));

      $("#jk-hierarchy").find(".jk-file.current").removeClass("current");
      $(this).addClass("current");

      that.currentFileId = $(this).data("file-id").split("-")[1];
    });
};

AppInteractionService.prototype.scrollTo = function (element) {
  if (!$(element).length) return;

  var offTop = $(element).offset().top - this.toolBarHeight - 10;

  $("html,body").scrollTop(offTop);
  this.updateCurentDiffPos();
};

AppInteractionService.prototype.updateCurentDiffPos = function () {
  if (
    $("#jk-hierarchy").is(":visible") &&
    $("#jk-hierarchy").find(".jk-file.current").is(":visible")
  ) {
    while (isAbove()) {
      $("#jk-hierarchy").scrollTop($("#jk-hierarchy").scrollTop() - 10);
    }

    while (isBelow()) {
      $("#jk-hierarchy").scrollTop($("#jk-hierarchy").scrollTop() + 10);
    }
  }

  function isAbove() {
    var pos = $("#jk-hierarchy").find(".jk-file.current").position();
    return pos && pos.top < 0;
  }

  function isBelow() {
    var pos = $("#jk-hierarchy").find(".jk-file.current").position();
    return pos && pos.top > $("#jk-hierarchy").height();
  }
};

AppInteractionService.prototype.getFiles = function () {
  return $(".file");
};

AppInteractionService.prototype.getComments = function () {
  return $("#files .js-comment.unminimized-comment");
};

AppInteractionService.prototype.getCurrentEl = function () {
  var files = this.getFiles();
  return files[this.currentFileId];
};

AppInteractionService.prototype.updateCurrentPos = function (keyCode) {
  if (this.currentFileId == null) {
    this.currentFileId = 0;
  } else if (
    this.currentFileId < this.files.length - 1 &&
    keyCode == this.hotKeysService.getKeyCodeForNextDiff()
  ) {
    this.currentFileId++;
  } else if (
    this.currentFileId > 0 &&
    keyCode == this.hotKeysService.getKeyCodeForPrevDiff()
  ) {
    this.currentFileId--;
  }
};

AppInteractionService.prototype.respondToHotKey = function (keyCode) {
  if (this.hotKeysService.isValidKeyCodeForDiff(keyCode)) {
    this.updateCurrentPos(keyCode);
    var el = this.getCurrentEl();
    this.scrollTo(el);
    return;
  }

  if (this.hotKeysService.isValidKeyCodeForSideBarToggle(keyCode)) {
    if (!this.isSidebarHaveContents()) {
      $("#jk-hierarchy").remove();
      this.main.generateApp();
    }

    if (this.isSidebarHaveContents()) {
      $("#jk-hierarchy").toggle();
    } else {
      $("#jk-notice").show().delay(1000).fadeOut(1000);
    }
  }

  if (this.hotKeysService.isValidKeyCodeForCloseSidebar(keyCode)) {
    if (this.isSidebarHaveContents() && $("#jk-hierarchy").is(":visible")) {
      $("#jk-hierarchy").hide();
    }
  }
};

AppInteractionService.prototype.isSidebarHaveContents = function () {
  return $("#jk-hierarchy").length && $("#jk-hierarchy")[0].innerHTML;
};
