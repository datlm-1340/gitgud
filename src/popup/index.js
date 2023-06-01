const Settings = {
  repositoryList: "GITGUD_REPOSITORIES",
  repositoryKeyIndex: 4,
  settingAttributes: ["repository-url", "endpoint", "username", "password"],
};

function fetchData(isSetting, settings) {
  chrome.tabs.query(
    {
      active: true,
      lastFocusedWindow: true,
    },
    function (tabs) {
      var currentTab = tabs[0];

      if (currentTab.url.includes("github.com") || isSetting == true) {
        var url = settings ? settings["repository-url"] : currentTab.url;
        var repositoryKey = url.split("/")[Settings.repositoryKeyIndex];

        chrome.storage.local.get(repositoryKey, function (data) {
          var repositoryData = JSON.parse(data[repositoryKey]);
          var xmlHttpRequest = new XMLHttpRequest();

          xmlHttpRequest.open("GET", repositoryData.endpoint, true);
          xmlHttpRequest.setRequestHeader(
            "Authorization",
            "Basic " + basicAuthEncode(repositoryData)
          );
          xmlHttpRequest.send();

          xmlHttpRequest.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
              var response = JSON.parse(this.response);
              var result = Object.keys(response).map(function (key) {
                return response[key];
              })[0];

              saveChecklist(repositoryKey, repositoryData, result);

              alert("UPDATE THÀNH CÔNG");

              if (isSetting == true) {
                window.open(settings["repository-url"]);
              } else {
                chrome.tabs.reload(currentTab.id);
              }
            } else if (this.readyState === 4 && this.status !== 200) {
              alert("UPDATE THẤT BẠI");
            }
          };
        });
      }
    }
  );
}

function basicAuthEncode(data) {
  if (!data) return;
  return btoa(data.username + ":" + data.password);
}

function formatFileTypes(checklist) {
  var init = [];
  var reducer = function (total, item) {
    item.file = item.file
      .split(",")
      .map(function (a) {
        return a.trim().toLowerCase();
      })
      .sort(function (a, b) {
        if (a == b) return 0;
        return a < b ? -1 : 1;
      })
      .join("_");

    total.push(item);
    return total;
  };

  return checklist.reduce(reducer, init);
}

function saveChecklist(key, data, result) {
  var storageData = {};

  data["checklist"] = formatFileTypes(result);
  storageData[key] = JSON.stringify(data);
  chrome.storage.local.set(storageData);
}

function saveSettings(repositoryKey) {
  var settings = {};
  var repositoryData = {};
  var nullCount = 0;

  Settings.settingAttributes.forEach(function (attr) {
    if (!$("#" + attr).val().length) {
      nullCount++;
      return;
    }

    settings[attr] = $("#" + attr).val();
  });

  if (nullCount > 0) return;

  repositoryData[repositoryKey] = JSON.stringify(settings);

  chrome.storage.local.set(repositoryData, function () {
    chrome.storage.local.get(null, function (items) {
      var allKeys = Object.keys(items);

      if (!allKeys.includes(Settings.repositoryList)) {
        chrome.storage.local.set(
          {
            GITGUD_REPOSITORIES: [],
          },
          addToRepositoryList(repositoryKey)
        );
      } else {
        addToRepositoryList(repositoryKey);
      }
    });

    fetchData(true, settings);
  });
}

function loadSettings(repositoryKey) {
  if (!repositoryKey) {
    Settings.settingAttributes.forEach(function (attr) {
      $("#" + attr).val(null);
    });

    return;
  }

  chrome.storage.local.get(repositoryKey, function (data) {
    if (data) {
      var settings = JSON.parse(data[repositoryKey]);

      Settings.settingAttributes.forEach(function (attr) {
        $("#" + attr).val(settings[attr]);
      });
    }
  });
}

function loadOptionForSelects() {
  chrome.storage.local.get(Settings.repositoryList, function (data) {
    var repositoryList = data[Settings.repositoryList];
    if (!repositoryList) return;

    repositoryList.forEach(function (repository) {
      $("#repository").append(
        $("<option>", {
          value: repository,
          text: repository,
        })
      );
    });
  });
}

function addToRepositoryList(repositoryKey) {
  chrome.storage.local.get(Settings.repositoryList, function (data) {
    var repositoryList = data[Settings.repositoryList] || [];

    repositoryList.push(repositoryKey);
    uniqueRepositoryList = repositoryList.filter(function (value, index, self) {
      return (
        self.indexOf(value) === index && value != null && value != undefined
      );
    });

    data[Settings.repositoryList] = uniqueRepositoryList;

    chrome.storage.local.set(data);
  });
}

$(document).ready(function () {
  chrome.tabs.query(
    {
      active: true,
      lastFocusedWindow: true,
    },
    function (tabs) {
      var currentTab = tabs[0];
      if (currentTab.url.includes("github.com")) {
        $("#not-on-github-popup").hide();
        $("#main-popup").show();
      } else {
        $("#not-on-github-popup").show();
        $("#main-popup").hide();
        $("#setting-btn").hide();
      }
    }
  );

  var repositoryURL = $("#repository").val() || $("#repository-url").val();

  if (repositoryURL) {
    var repositoryKey = repositoryURL.split("/")[Settings.repositoryKeyIndex];
    loadSettings(repositoryKey);
  }

  loadOptionForSelects();

  $("#update").click(function () {
    fetchData();
  });

  $("#setting-popup").on("submit", function (e) {
    e.preventDefault();

    var repositoryKey =
      $("#repository").val() ||
      $("#repository-url").val().split("/")[Settings.repositoryKeyIndex];
    saveSettings(repositoryKey);
  });

  $("#repository").on("change", function () {
    loadSettings($("#repository").val());
  });

  $("#setting-btn").on("click", function () {
    chrome.runtime.openOptionsPage();
  });
});
