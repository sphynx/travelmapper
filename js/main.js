var ds_travelmapper = ( function() {

    String.prototype.repeat = function(num) {
         return new Array(num + 1).join(this);
    };

    var travelled = loadFromLocalStorage();

    function loadFromLocalStorage() {
        return supportsStorage()
            ? decode(localStorage["travelmapper.countries"])
            : [];
    };

    function saveInLocalStorage() {
        if (supportsStorage()) {
            localStorage["travelmapper.countries"] = encode(travelled);
        }
    };

    function supportsStorage() {
        try {
            return "localStorage" in window && window["localStorage"] !== null;
        } catch (e) {
            return false;
        }
    }

    function formatMapUrl() {
        var base = "http://chart.apis.google.com/chart",
            chart = "?cht=map:fixed=-70,-180,80,180",
            mapSize = "&chs=600x400",
            bgColor = "&chf=bg,s,336699",
            waterAndCountryColors = "&chco=d0d0d0,cc0000",
            countriesStr = "&chld="
                + $.map(travelled, function(country) { return country.code; }).join("|"),
            chd = "&chd=s:" + "9".repeat(travelled.length);

        return base + chart + mapSize + bgColor + waterAndCountryColors + countriesStr + chd;
    }

    // encode countries in string to save in local storage
    function encode() {
        return $.map(travelled,
                     function(country) { return country.code + ":" + country.name; })
                .join("|");
    };

    // decode from the string using the same format
    function decode(countriesStr) {
        if (!countriesStr) return [];

        var codeNames = countriesStr.split("|");
        return $.map(codeNames, function(codeName) {
            var pair = codeName.split(":");
            return { code: pair[0], name: pair[1] };
        });
    }

    function updateView() {
        var mapUrl = formatMapUrl(travelled);
        $("#map-img").attr("src", mapUrl);
        $("#url-area").text(mapUrl);
        $("#counter").html("" + travelled.length);
        if (travelled.length > 0) {
            $("#no-countries").hide();
        } else {
            $("#no-countries").show();
        }
    }

    function createCountryElement(country) {
        return $("<button>").addClass("button icon pin").text(country.name)
          .click(
            function() { removeCountry($(this).get(0)); })
          .hover(
            function() { $(this).addClass("remove").removeClass("pin"); },
            function() { $(this).addClass("pin").removeClass("remove"); }
        );
    }

    function addCountry(country) {
        for (var i = 0; i < travelled.length; i++) {
            if (travelled[i].name === country.name) {
                // do not allow duplicates
                return;
            }
        }

        // no duplicates, so add it to our 'travelled' data and update 'view'
        travelled.push(country);

        $("#selected-countries").append(createCountryElement(country));
        updateView();
        saveInLocalStorage();
    }

    function removeCountry(el) {
        for (var i = 0; i < travelled.length; i++) {
            if (travelled[i].name === el.textContent) {
                travelled.splice(i, 1);
                $(el).remove();
                updateView();
                saveInLocalStorage();
                return;
            }
        }
    }

    function draw() {
        $.each(travelled,
           function (ix, country) {
              $("#selected-countries").append(createCountryElement(country));
            });

        updateView();
    }

    return {
        addCountry: addCountry,
        draw: draw
    };
})();

$.fn.clearField = function() {
    return this.focus(function() {
        if (this.value == this.defaultValue) {
            this.value = "";
        }
    }).blur(function() {
        this.value = this.defaultValue;
    });
};

$(function() {
	var ac_country = $("#ac_country");
    var mapper = ds_travelmapper;

	ac_country.autocomplete(countries, {
		minChars: 2,
		width: 320,
		max: 0,
		matchContains: true,
		scroll: true,
		formatItem: function(row) {
			return "<img src='images/flags/" + row.code.toLowerCase() + ".gif'/> "
                + row.name;
		},
		formatResult: function(row) {
			return row.name;
		},
		formatMatch: function(row) {
			return row.name;
		}
	});

	ac_country.removeAttr("name", "").clearField();
	ac_country.result(
        function(event, data) {
            $(ac_country).val("");
            mapper.addCountry(data);
	    });

    mapper.draw();
});
