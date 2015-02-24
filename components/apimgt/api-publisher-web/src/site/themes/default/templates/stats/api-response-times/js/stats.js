var t_on = {
    'apiChart': 1,
    'subsChart': 1,
    'serviceTimeChart': 1,
    'tempLoadingSpace': 1
};
var currentLocation;

var chartColorScheme1 = ["#3da0ea", "#bacf0b", "#e7912a", "#4ec9ce", "#f377ab", "#ec7337", "#bacf0b", "#f377ab", "#3da0ea", "#e7912a", "#bacf0b"];
//fault colors || shades of red
var chartColorScheme2 = ["#ED2939", "#E0115F", "#E62020", "#F2003C", "#ED1C24", "#CE2029", "#B31B1B", "#990000", "#800000", "#B22222", "#DA2C43"];
//fault colors || shades of blue
var chartColorScheme3 = ["#0099CC", "#436EEE", "#82CFFD", "#33A1C9", "#8DB6CD", "#60AFFE", "#7AA9DD", "#104E8B", "#7EB6FF", "#4981CE", "#2E37FE"];
currentLocation = window.location.pathname;
var statsEnabled = isDataPublishingEnabled();

require(["dojo/dom", "dojo/domReady!"], function (dom) {
    currentLocation = window.location.pathname;
    //Initiating the fake progress bar
    jagg.fillProgress('apiChart');
    jagg.fillProgress('subsChart');
    jagg.fillProgress('serviceTimeChart');
    jagg.fillProgress('tempLoadingSpace');

    jagg.post("/site/blocks/stats/api-response-times/ajax/stats.jag", { action: "getFirstAccessTime", currentLocation: currentLocation  },
        function (json) {

            if (!json.error) {

                if (json.usage && json.usage.length > 0) {
                    var d = new Date();
                    var firstAccessDay = new Date(json.usage[0].year, json.usage[0].month - 1, json.usage[0].day);
                    var currentDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(),d.getHours(),d.getMinutes());//                    if (firstAccessDay.valueOf() == currentDay.valueOf()) {

                    //day picker
                    $('#today-btn').on('click',function(){
                        var to = convertTimeString(currentDay);
                        var from = convertTimeString(currentDay-86400000);
                        var dateStr= from+" to "+to;
                        $("#date-range").html(dateStr);
                        $('#date-range').data('dateRangePicker').setDateRange(from,to);
                        drawProviderAPIServiceTime(from,to);

                    });

                    //hour picker
                    $('#hour-btn').on('click',function(){
                        var to = convertTimeString(currentDay);
                        var from = convertTimeString(currentDay-3600000);
                        var dateStr= from+" to "+to;
                        $("#date-range").html(dateStr);
                        $('#date-range').data('dateRangePicker').setDateRange(from,to);
                        drawProviderAPIServiceTime(from,to);
                    })

                    //week picker
                    $('#week-btn').on('click',function(){
                        var to = convertTimeString(currentDay);
                        var from = convertTimeString(currentDay-604800000);
                        var dateStr= from+" to "+to;
                        $("#date-range").html(dateStr);
                        $('#date-range').data('dateRangePicker').setDateRange(from,to);
                        drawProviderAPIServiceTime(from,to);
                    })

                    //month picker
                    $('#month-btn').on('click',function(){

                        var to = convertTimeString(currentDay);
                        var from = convertTimeString(currentDay-(604800000*4));
                        var dateStr= from+" to "+to;
                        $("#date-range").html(dateStr);
                        $('#date-range').data('dateRangePicker').setDateRange(from,to);
                        drawProviderAPIServiceTime(from,to);
                    });

                    //date picker
                    $('#date-range').dateRangePicker(
                        {
                            startOfWeek: 'monday',
                            separator : ' to ',
                            format: 'YYYY-MM-DD HH:mm',
                            autoClose: false,
                            time: {
                                enabled: true
                            },
                            shortcuts:'hide',
                            endDate:currentDay
                        })
                        .bind('datepicker-change',function(event,obj)
                        {

                        })
                        .bind('datepicker-apply',function(event,obj)
                        {
                             var from = convertDate(obj.date1);
                             var to = convertDate(obj.date2);
                             $('#date-range').html(from + " to "+ to);
                             drawProviderAPIVersionUserLastAccess(from,to);
                        })
                        .bind('datepicker-close',function()
                        {
                    });

                    //setting default date
                    var to = new Date();
                    var from = new Date(to.getTime() - 1000 * 60 * 60 * 24 * 30);

                    $('#date-range').data('dateRangePicker').setDateRange(from,to);
                    $('#date-range').html($('#date-range').val());
                    var fromStr = convertDate(from);
                    var toStr = convertDate(to);
                    drawProviderAPIServiceTime(fromStr,toStr);


                    $('#date-range').click(function (event) {
                    event.stopPropagation();
                    });

                    $('body').on('click', '.btn-group button', function (e) {
                        $(this).addClass('active');
                        $(this).siblings().removeClass('active');
                    });

                    var width = $("#rangeSliderWrapper").width();
                    //$("#rangeSliderWrapper").affix();
                    $("#rangeSliderWrapper").width(width);

                }

                else if (json.usage && json.usage.length == 0 && statsEnabled) {
                    $('#middle').html("");
                    $('#middle').append($('<div class="errorWrapper"><img src="../themes/default/templates/stats/images/statsEnabledThumb.png" alt="Stats Enabled"></div>'));
                }

                else {
                    $('#middle').html("");
                    $('#middle').append($('<div class="errorWrapper"><span class="label top-level-warning"><i class="icon-warning-sign icon-white"></i>'
                        + i18n.t('errorMsgs.checkBAMConnectivity') + '</span><br/><img src="../themes/default/templates/stats/api-response-times/images/statsThumb.png" alt="Smiley face"></div>'));
                }


            }
            else {
                if (json.message == "AuthenticateError") {
                    jagg.showLogin();
                } else {
                    jagg.message({content: json.message, type: "error"});
                }
            }
            t_on['apiChart'] = 0;
        }, "json");

});

var drawProviderAPIServiceTime = function (from, to) {
    var fromDate = from;
    var toDate = to;
    jagg.post("/site/blocks/stats/api-response-times/ajax/stats.jag", { action: "getProviderAPIServiceTime", currentLocation: currentLocation, fromDate: fromDate, toDate: toDate },
        function (json) {
            if (!json.error) {

                    var length = json.usage.length, s1 = [];
                    var data = [];
                    $('#checkboxContainer').empty();
                    $('#serviceTimeChart').empty();
                    var $dataTable = $('<table class="display" width="100%" cellspacing="0" id="apiSelectTable"></table>');
                        $dataTable.append($('<thead class="tableHead"><tr>' +
                            '<th width="10%"></th>' +
                            '<th>API</th>' +
                            '<th>Response Time(ms)</th>'+
                            '</tr></thead>'));

                    var filterValues = [];
                    var defaultFilterValues = [];
                    var state_array = [];

                    $('#checkboxContainer').append($dataTable);
                    $('#checkboxContainer').show();

                        for (var i = 0; i < length; i++) {
                            data[i] = [json.usage[i].apiName, parseFloat(json.usage[i].serviceTime)];
                        }

                        data.sort(function(obj1, obj2) {
                             return obj2[1] - obj1[1];
                        });

                        for (var i = 0; i < data.length; i++) {
                        //add fake value to overcome dojo chart single series issue
                        if (length === 1) {
                            defaultFilterValues.push(["", 0]);
                        }

                        if(i<9){
                        $dataTable.append($('<tr><td >'
                                        + '<input name="item_checkbox"  checked   id=' + i + '  type="checkbox"  data-item=' + data[i][0]
                                        + ' class="inputCheckbox" />'
                                        + '</td><td style="text-align:left;"><label for=' + i + '>' + data[i][0] + '</label></td>'
                                        + '<td style="text-align:right;"><label for=' + i + '>' + data[i][1] + '</label></td></tr>'));
                                    filterValues.push([data[i][0],data[i][1]]);
                                    state_array.push(true);
                                    defaultFilterValues.push([data[i][0],data[i][1]]);

                                } else {

                                    $dataTable.append($('<tr><td >'
                                         + '<input name="item_checkbox"    id=' + i + '  type="checkbox"  data-item=' + data[i][0]
                                         + ' class="inputCheckbox" />'
                                         + '</td><td style="text-align:left;"><label for=' + i + '>' + data[i][0] + '</label></td>'
                                         + '<td style="text-align:right;"><label for=' + i + '>' + data[i][1] + '</label></td></tr>'));
                                    filterValues.push([data[i][0],data[i][1]]);
                                    state_array.push(false);

                                }
                    }
                    $('#checkboxContainer').append($dataTable);
                        $('#checkboxContainer').show();
                        $('#apiSelectTable').DataTable({
                            retrieve: true,
                            "order": [
                                [ 2, "desc" ]
                            ],
                            "aoColumns": [
                                { "bSortable": false },
                                null,
                                null
                            ],
                        });

                    if (length > 0) {
                        var height = 450;
                        if (30 * length > 450) height = 30 * length;
                        $('#serviceTimeChart').height(height);
                        require([
                            // Require the basic chart class
                            "dojox/charting/Chart",

                            // Require the theme of our choosing
                            "dojox/charting/themes/ApimDefault",

                            // Tooltip
                            "dojox/charting/action2d/Tooltip",
                            // Require the highlighter
                            "dojox/charting/action2d/Highlight",

                            //  We want to plot bars
                            "dojox/charting/plot2d/Bars",

                            //  We want to use Markers
                            "dojox/charting/plot2d/Markers",

                            //  We'll use default x/y axes
                            "dojox/charting/axis2d/Default",

                            //mouse zoom and pan
                            "dojox/charting/action2d/MouseZoomAndPan",

                            // Wait until the DOM is ready
                            "dojo/domReady!"
                        ], function (Chart, theme, MouseZoomAndPan, Highlight) {

                            // Create the chart within it's "holding" node
                            var serviceTimeChart = new Chart("serviceTimeChart");

                            // Set the theme
                            serviceTimeChart.setTheme(theme);

                            // Add the only/default plot
                            serviceTimeChart.addPlot("default", {
                                type: "Bars",
                                markers: true,
                                gap: 5,
                                animate: {duration: 800}
                            });

                            // Add axes
                            serviceTimeChart.addAxis("x", { title: 'Response Time(ms)',titleOrientation: "away",minorTicks:false, fixLower: "major", fixUpper: "major" });
                            serviceTimeChart.addAxis("y", {title: 'API',vertical: true,minorTicks:false,majorLabels: true,
                                labels: dojo.map(defaultFilterValues, function (value, index) {

                                    return {value: index + 1, text: value[0]};

                                })
                            });

                            // Define the data
                            var chartData;
                            var color = -1;
                            require(["dojo/_base/array"], function (array) {
                                chartData = array.map(defaultFilterValues, function (d) {
                                    color++;
                                    return {y: d[1], text: d[0], tooltip: "<b>" + d[0] + "</b><br /><i>" + d[1] + "ms</i>", fill: "#0099CC"};
                                });
                            });

                            // Add the series of data
                            serviceTimeChart.addSeries("API Service Time", chartData);

                            new MouseZoomAndPan(serviceTimeChart, "default", { axis: "x"});

                            new Highlight(serviceTimeChart, "default");

                            // Render the chart!
                            serviceTimeChart.render();

                        });

                         $('#apiSelectTable').on('change', 'input.inputCheckbox', function () {

                            $('#serviceTimeChart').empty();
                            var id = $(this).attr('id');
                            var check = $(this).is(':checked');
                            var tickValue = $(this).attr('data-item');
                            var draw_chart = [];

                            if (check) {
                                if(($( "input:checked" ).length)>9){
                                    alert("Please uncheck and then select to display this on graph");
                                state_array[id] = false;
                                $(this).prop("checked", "");
                                }else{
                                state_array[id] = true;
                                }
                            } else {
                                state_array[id] = false;
                            }


                            $.each(filterValues, function (index, value) {
                                if (state_array[index]) {
                                    draw_chart.push(value);
                                }
                            });

                            if (draw_chart.length === 1) {
                               draw_chart.push(["", 0]);
                            }

                            var height = 450;
                            if (30 * length > 450) height = 30 * length;
                            $('#serviceTimeChart').height(height);
                            require([
                                // Require the basic chart class
                                "dojox/charting/Chart",

                                // Require the theme of our choosing
                                "dojox/charting/themes/ApimDefault",

                                // Tooltip
                                "dojox/charting/action2d/Tooltip",
                                // Require the highlighter
                                "dojox/charting/action2d/Highlight",

                                //  We want to plot bars
                                "dojox/charting/plot2d/Bars",

                                //  We want to use Markers
                                "dojox/charting/plot2d/Markers",

                                //  We'll use default x/y axes
                                "dojox/charting/axis2d/Default",

                                //mouse zoom and pan
                                "dojox/charting/action2d/MouseZoomAndPan",

                                // Wait until the DOM is ready
                                "dojo/domReady!"
                            ], function (Chart, theme, MouseZoomAndPan, Highlight) {


                                // Create the chart within it's "holding" node
                                var serviceTimeChart = new Chart("serviceTimeChart");

                                // Set the theme
                                serviceTimeChart.setTheme(theme);

                                // Add the selected plot
                                serviceTimeChart.addPlot("default", {
                                    type: "Bars",
                                    markers: true,
                                    gap: 5,
                                    animate: {duration: 800}
                                });

                                // Add axes
                                serviceTimeChart.addAxis("x", { title: 'Response Time(ms)',titleOrientation: "away", minorTicks:false,fixLower: "major", fixUpper: "major" });
                                serviceTimeChart.addAxis("y", {title: 'API',minorTicks:false,vertical: true,
                                    labels: dojo.map(draw_chart, function (value, index) {
                                        return {value: index + 1, text: value[0]};
                                    })
                                });

                                // Define the data
                                var chartData;
                                var color = -1;
                                require(["dojo/_base/array"], function (array) {
                                    chartData = array.map(draw_chart, function (d) {
                                        color++;
                                        return {y: d[1], text: d[0], tooltip: "<b>" + d[0] + "</b><br /><i>" + d[1] + "s</i>", fill: "#0099CC"};
                                    });
                                });

                                // Add the series of data
                                serviceTimeChart.addSeries("API Service Time", chartData);

                                new MouseZoomAndPan(serviceTimeChart, "default", { axis: "x"});

                                new Highlight(serviceTimeChart, "default");

                                // Render the chart!
                                serviceTimeChart.render();

                            });
                         });

                } else {
                    $('#serviceTimeChart').css("fontSize", 14);
                    $('#serviceTimeChart').append($('<span class="label label-info">' + i18n.t('errorMsgs.noData') + '</span>'));
                }


            } else {
                if (json.message == "AuthenticateError") {
                    jagg.showLogin();
                } else {
                    jagg.message({content: json.message, type: "error"});
                }
            }
            t_on['serviceTimeChart'] = 0;
        }, "json");
}

function isDataPublishingEnabled(){
    jagg.post("/site/blocks/stats/api-response-times/ajax/stats.jag", { action: "isDataPublishingEnabled"},
        function (json) {
            if (!json.error) {
                statsEnabled = json.usage;
                return statsEnabled;
            } else {
                if (json.message == "AuthenticateError") {
                    jagg.showLogin();
                } else {
                    jagg.message({content: json.message, type: "error"});
                }
            }
        }, "json");        
}


var convertTimeString = function(date){
    var d = new Date(date);
    var formattedDate = d.getFullYear() + "-" + formatTimeChunk((d.getMonth()+1)) + "-" + formatTimeChunk(d.getDate())+" "+formatTimeChunk(d.getHours())+":"+formatTimeChunk(d.getMinutes());
    return formattedDate;
};

var convertTimeStringPlusDay = function (date) {
    var d = new Date(date);
    var formattedDate = d.getFullYear() + "-" + formatTimeChunk((d.getMonth() + 1)) + "-" + formatTimeChunk(d.getDate() + 1);
    return formattedDate;
};

var formatTimeChunk = function (t) {
    if (t < 10) {
        t = "0" + t;
    }
    return t;
};

function convertDate(date) {
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hour=date.getHours();
    var minute=date.getMinutes();
    return date.getFullYear() + '-' + (('' + month).length < 2 ? '0' : '')
        + month + '-' + (('' + day).length < 2 ? '0' : '') + day +" "+ (('' + hour).length < 2 ? '0' : '')
        + hour +":"+(('' + minute).length < 2 ? '0' : '')+ minute;
}

