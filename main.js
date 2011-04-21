var travelled = [];

function formatMapUrl(countries) {
    var base = "http://chart.apis.google.com/chart?cht=map:fixed=-70,-180,80,180";
    var colors = "&chs=600x400&chf=bg,s,336699&chco=d0d0d0,cc0000";
    var countriesStr = "&chld=";
    var chd = "&chd=s:";
    for (var i = 0; i < countries.length; i++) {
        countriesStr += countries[i].code + "|";
        chd += "9";
    }
    return base + colors + countriesStr + chd;
}

function update() {
    var mapUrl = formatMapUrl(travelled);
    $("#map-img").attr("src", mapUrl);
    $("#url-area").text(mapUrl);
    $("#no-countries").html(travelled.length > 0 ? "count: " + travelled.length : "none");
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
    var elt = "<button class='button icon pin' onclick='removeCountry(this)'>" + country.name + "</button>";
    //var elt = "<li class='country' onclick='removeCountry(this)'>" + country.name + "</li>";
    $("#selected-countries").append(elt);
    update();
}

function removeCountry(el) {
    for (var i = 0; i < travelled.length; i++) {
        if (travelled[i].name === el.textContent) {
            travelled.splice(i, 1);
            $(el).remove();
            update();
            return;
        }
    }
}

$.fn.clearField = function() {
    return this.focus(function() {
        if( this.value == this.defaultValue ) {
            this.value = "";
        }
    }).blur(function() {
        this.value = this.defaultValue;
    });
};	

$(function() {
	var ac_country = "#ac_country";
	$(ac_country).autocomplete(countries, {
		minChars: 1,
		width: 320,
		matchContains: true,
		scroll: true,
		max: 0,
		formatItem: function(row, i, max, term) {
			return "<img src='images/flags/" + row.code.toLowerCase() + ".gif'/> " + row.name;
		},
		formatResult: function(row) {
			return row.name;
		},
		formatMatch: function(row, i, max) {
			return row.name;
		}
	});

	$(ac_country).removeAttr("name", "").clearField();
	$(ac_country).result(
        function(event, data, formatted) {
            $(ac_country).val("");
            addCountry(data);
	    });
});
