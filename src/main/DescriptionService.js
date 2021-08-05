const templateItems = [
  "Ticket",
  "Impact Range",
  "1, Target Screens",
  "2, Target Functions",
  "3, Target Objects",
  "4, Target Roles",
  "Evidences",
  "Grep",
  "Note",
];

const optionalItems = ["Impact Range", "Note", "4, Target Roles"];

const warnings = [
  "Vui lòng điền đầy đủ nha",
  "Điền đầy đủ đi bạn ơi",
  "Ơ bạn có thấy thiêu thiếu gì không ?",
  "Không điền đủ là không review đâu nha",
  "Nhớ điền đủ mấy cái này nhé",
  "Điền Vào Ô Trống (250) - Cá Hồi Hoang",
  "Điền đi bạn êi",
  "Điền đủ thì mình thương nà",
  "Úi, thiếu rồi này",
  "Sếp bảo điền thiếu là không cho merged đâu",
];

const jackpots = [
  "Hãy lấp đầy khoảng trống của em đi (uwu)",
  "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
];

function DescriptionService(element) {
  this.element = element;
}

function getRandomQuote(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function warning() {
  if (Math.floor(Math.random() * 100) == 69) {
    return getRandomQuote(jackpots);
  }

  return getRandomQuote(warnings);
}

DescriptionService.prototype.reviewDescription = function (edited) {
  console.count();

  if (edited) {
    $(".desc-review-tooltip").remove();
  }

  var parentSelector = "td.d-block.comment-body.markdown-body.js-comment-body";
  templateItems.forEach(function (item, i) {
    if (optionalItems.includes(item)) return;

    var indicator = $(
      '<span class="gitgud-tooltip warning-count desc-review-tooltip">' +
        '<b class="icon-warning">!</b>' +
        '<span class="gitgud-tooltip-content"><p>' +
        warning() +
        "</p></span></span>"
    );

    var itemHeading = $(parentSelector + ' h3:contains("' + item + '")').length
      ? $(parentSelector + ' h3:contains("' + item + '")')
      : $(parentSelector + ' h4:contains("' + item + '")');

    if (!edited && itemHeading.hasClass("description-reviewed")) return;

    var next = $(itemHeading).next();

    if (templateItems.includes($(next).text()) || !$(next).length) {
      itemHeading.addClass("description-reviewed").append(indicator);
    }
  });
};
