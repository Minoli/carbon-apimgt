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

var clicked1=false;
var clicked2=false;
var clicked3=false;
var clicked4=false;

require(["dojo/dom", "dojo/domReady!"], function (dom) {
    currentLocation = window.location.pathname;
    //Initiating the fake progress bar
    jagg.fillProgress('apiChart');
    jagg.fillProgress('subsChart');
    jagg.fillProgress('serviceTimeChart');
    jagg.fillProgress('tempLoadingSpace');

    jagg.post("/site/blocks/stats/api-usage-resource-path/ajax/stats.jag", { action: "getFirstAccessTime", currentLocation: currentLocation  },
        function (json) {

            if (!json.error) {

                if (json.usage && json.usage.length > 0) {
                    var d = new Date();
                    var firstAccessDay = new Date(json.usage[0].year, json.usage[0].month - 1, json.usage[0].day);
                    var currentDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(),d.getHours(),d.getMinutes());//                    if (firstAccessDay.valueOf() == currentDay.valueOf()) {
//                        currentDay = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
//                    }
//                    var rangeSlider = $("#rangeSlider");
//                    //console.info(currentDay);
//                    rangeSlider.dateRangeSlider({
//                        "bounds": {
//                            min: firstAccessDay,
//                            max: currentDay
//                        },
//                        "defaultValues": {
//                            min: firstAccessDay,
//                            max: currentDay
//                        }
//                    });
//                    rangeSlider.bind("valuesChanged", function (e, data) {
//                        var from = convertTimeString(data.values.min);
//                        var to = convertTimeStringPlusDay(data.values.max);
//
//                        drawAPIUsageByResourcePath(from, to);
//
//                    });

                    //day picker
                    $('#today-btn').on('click',function(){
                        var to = convertTimeString(currentDay);
                        var from = convertTimeString(currentDay-86400000);
                        var dateStr= from+" to "+to;
                        $("#date-range").html(dateStr);
                        $('#date-range').data('dateRangePicker').setDateRange(from,to);
                        drawAPIUsageByResourcePath(from,to);

                    });

                    //hour picker
                    $('#hour-btn').on('click',function(){
                        var to = convertTimeString(currentDay);
                        var from = convertTimeString(currentDay-3600000);
                        var dateStr= from+" to "+to;
                        $("#date-range").html(dateStr);
                        $('#date-range').data('dateRangePicker').setDateRange(from,to);
                        drawAPIUsageByResourcePath(from,to);
                    })

                    //week picker
                    $('#week-btn').on('click',function(){
                        var to = convertTimeString(currentDay);
                        var from = convertTimeString(currentDay-604800000);
                        var dateStr= from+" to "+to;
                        $("#date-range").html(dateStr);
                        $('#date-range').data('dateRangePicker').setDateRange(from,to);
                        drawAPIUsageByResourcePath(from,to);
                    })

                    //month picker
                    $('#month-btn').on('click',function(){

                        var to = convertTimeString(currentDay);
                        var from = convertTimeString(currentDay-(604800000*4));
                        var dateStr= from+" to "+to;
                        $("#date-range").html(dateStr);
                        $('#date-range').data('dateRangePicker').setDateRange(from,to);
                        drawAPIUsageByResourcePath(from,to);
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
                             drawAPIUsageByResourcePath(from,to);
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
                    drawAPIUsageByResourcePath(fromStr,toStr);


                    $('#date-range').click(function (event) {
                    event.stopPropagation();
                    });

                    $('body').on('click', '.btn-group button', function (e) {
                        $(this).addClass('active');
                        $(this).siblings().removeClass('active');
                    });


                    var width = $("#rangeSliderWrapper").width();
                    $("#rangeSliderWrapper").affix();
                    $("#rangeSliderWrapper").width(width);

                }

                else if (json.usage && json.usage.length == 0 && statsEnabled) {
                    $('#middle').html("");
                    $('#middle').append($('<div class="errorWrapper"><img src="../themes/default/templates/stats/images/statsEnabledThumb.png" alt="Stats Enabled"></div>'));
                }

                else {
                    $('#middle').html("");
                    $('#middle').append($('<div class="errorWrapper"><span class="label top-level-warning"><i class="icon-warning-sign icon-white"></i>'
                        + i18n.t('errorMsgs.checkBAMConnectivity') + '</span><br/><img src="../themes/default/templates/stats/api-usage-resource-path/images/statsThumb.png" alt="Smiley face"></div>'));
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


var drawAPIUsageByResourcePath = function (from, to) {
    var fromDate = from;
    var toDate = to;
    jagg.post("/site/blocks/stats/api-usage-resource-path/ajax/stats.jag", { action: "getAPIUsageByResourcePath", currentLocation: currentLocation, fromDate: fromDate, toDate: toDate},
        function (json) {
            if (!json.error) {
                $('#resourcePathUsageTable').find("tr:gt(0)").remove();
                var length = json.usage.length;

                $('#tempLoadingSpaceResourcePath').empty();
                $('#chartContainer').empty();

                $('div#resourcePathUsageTable_wrapper.dataTables_wrapper.no-footer').remove();
                var chart;
                var $dataTable =$('<table class="table tablesorter graphTable" id="resourcePathUsageTable"></table>');

                $dataTable.append($('<thead class="tableHead"><tr>'+
                                        '<th id="api">api</th>'+
                                        '<th id="version">version</th>'+
                                        '<th id="context">context</th>'+
                                        '<th>method</th>'+
                                        '<th>Hits</th>'+
                                    '</tr></thead>'));

                var obj, result;
                var webapps = [];

                     for(x=0;x<length;x++){

                         var webappIndex = -1;
                         var webappVersionIndex = -1;
                         var webresourceIndex = -1;

                         for(y=0;y<webapps.length;y++){

                             if(webapps[y][0] == json.usage[x].apiName){
                                 webappIndex = y;
                                 var z;
                                 for(z=0;z<webapps[y][1].length;z++){
                                     if(webapps[y][1][z][0] ==  json.usage[x].version){
                                         webappVersionIndex = z;
                                         var t;
                                         for(t=0;t<webapps[y][1][z][1].length;t++){
                                             if(webapps[y][1][z][1][t][0] == json.usage[x].context){
                                                 webresourceIndex = t;
                                                 break;
                                             }
                                         }
                                     }
                                 }
                                 if((webappVersionIndex == -1) && (z == webapps[y].length)){
                                     break;
                                 }
                             }
                         }

                         if(webappIndex == -1){
                             var version = [];
                             var requestCount = [];
                             var resourse =[];
                             requestCount.push([json.usage[x].count,json.usage[x].time]);
                             resourse.push([json.usage[x].context,requestCount,json.usage[x].method]);
                             version.push([json.usage[x].version,resourse]);
                             webapps.push([json.usage[x].apiName,version]);
                         }else{
                             if(webappVersionIndex == -1){
                                 var requestCount = [];
                                 var resourse =[];
                                 requestCount.push([json.usage[x].count,json.usage[x].time]);
                                 resourse.push([json.usage[x].context,requestCount,json.usage[x].method]);
                                 webapps[webappIndex][1].push([json.usage[x].version,resourse]);
                             }else{
                                 if(webresourceIndex == -1){
                                     var requestCount = [];
                                     requestCount.push([json.usage[x].count,json.usage[x].time]);
                                     webapps[webappIndex][1][webappVersionIndex][1].push([json.usage[x].context,requestCount,json.usage[x].method]);
                                 }else{
                                     webapps[webappIndex][1][webappVersionIndex][1][webresourceIndex][1].push([json.usage[x].count,json.usage[x].time]);
                             }

                             }
                         }
                     }
                var parsedResponse=webapps;


                var data=[];
                function dateToUnix(year, month, day, hour, minute, second) {
                    return ((new Date(year, month - 1, day, hour, minute, second)).getTime() );
                }
                var linkId=0;
                var rowId=0;
                for ( var i = 0; i < parsedResponse.length; i++) {

                    var appName =(parsedResponse[i][0]);
                    var version;
                    var hitCount =0;
                    var lastaccesTime;
                    var contextName;
                    var numberOfaccesTime;
                    var numberOfContext;
                    var method;
                    linkId++;
                    rowId++;

                    for ( var j = 0; j < parsedResponse[i][1].length; j++) {
                        numberOfContext = parsedResponse[i][1][j][1].length;
                        version = parsedResponse[i][1][j][0]
                        //alert("version "+version);

                        for ( var k = 0; k < numberOfContext; k++) {

                            numberOfaccesTime =parsedResponse[i][1][j][1][k][1].length;

                            contextName = parsedResponse[i][1][j][1][k][0];
                            method= parsedResponse[i][1][j][1][k][2];

                            for(var m = 0; m < numberOfaccesTime; m++){
                               hitCount = Number(hitCount)+Number(parsedResponse[i][1][j][1][k][1][m][0]);
                               hits=parsedResponse[i][1][j][1][k][1][m][0];
                                time = parsedResponse[i][1][j][1][k][1][m][1];
                            }

                            lastaccesTime = parsedResponse[i][1][j][1][k][1][Number(numberOfaccesTime)-1][1];
                        }
                    $dataTable.append($('<tr id='+rowId+'><td>' + appName + '</td><td>' + version + '</td><td>' +'<a id="'+rowId+'" class="link" href="#" >'+contextName+'</a>'+ '</td><td>' + method + '</td><td class="tdNumberCell">' + hitCount+ '</td></tr>'));
                    }
                }

                  $dataTable.on("click", '.link',function(){
                        var answerid = $(this).attr('id');
                        var test= $(this).closest('tr').attr('id');

                        function getCell(column, row) {
                            var column = $('#' + column).index();
                            var row = $('#' + row)
                            return row.find('td').eq(column);
                        }

                        var context=$(this).text();

                        for ( var i = 0; i < parsedResponse.length; i++) {

                        if( parsedResponse[i][0] ==  getCell('api', ''+test+'').html()){
                            for ( var j = 0; j < parsedResponse[i][1].length; j++) {
                                if( parsedResponse[i][1][j][0] ==  getCell('version', ''+test+'').html()){
                                   numOfVersion = parsedResponse[i][1][j][1].length;
                                    for( var t = 0; t < numOfVersion; t++) {
                                            if( parsedResponse[i][1][j][1][t][0] ==  context){
                                           var dataTest=[];
                                                for( var k = 0; k < parsedResponse[i][1][j][1][t][1].length; k++) {
                                                hits=parsedResponse[i][1][j][1][t][1][k][0];
                                                     var time=parsedResponse[i][1][j][1][t][1][k][1];
                                                     var str = time;
                                                     var d=new Date(str.split(' ')[0].split('-').join(',') + ',' + str.split(' ')[1].split('-').join(','));

                                                     var year= d.getFullYear();
                                                     var month=d.getMonth();
                                                     var date= d.getDate();
                                                     var hour=d.getHours();
                                                     var min= d.getMinutes();
                                                     var second=d.getSeconds();

                                                    var dateInSeconds = dateToUnix(year,(month+1),date,hour,min, second);
                                                    var s=dateInSeconds+"";

                                                dataTest.push({
                                                         'y':hits,
                                                         'x':dateInSeconds
                                                     });
                                                }

                                                dataTest.sort(function(obj1, obj2) {

                                                return obj1.x - obj2.x;
                                                });

                                                nv.addGraph(function () {
                                                    chart = nv.models.lineWithFocusChart();
                                                    chart.color(d3.scale.category20b().range());
                                                    chart.yAxis.tickFormat(d3.format(',.2f'));
                                                    chart.y2Axis.tickFormat(d3.format(',.2f'));
                                                    chart.xAxis.tickFormat(function (d) {
                                                     if(clicked1){
                                                        return d3.time.format('%d %b %H:%M')(new Date(d))
                                                    }else if(clicked2){
                                                        return d3.time.format('%H:%M:%S')(new Date(d))
                                                    }else if(clicked3){
                                                        return d3.time.format('%d %b %Y %H:%M')(new Date(d))
                                                    }else{
                                                        return d3.time.format('%d %b %Y %H:%M')(new Date(d))
                                                    }

                                                    });
                                                    chart.x2Axis.tickFormat(function (d) {

                                                        return d3.time.format('%d %b %Y %H:%M:%S')(new Date(d))
                                                    });
                                                    chart.tooltipContent(function (key, y, e, graph) {
                                                        var x = d3.time.format('%d %b %Y %H:%M:%S')(new Date(parseInt(graph.point.x)));
                                                        var y = String(graph.point.y);
                                                        if (key == 'Hits') {
                                                            var y = 'There is ' + String(graph.point.y) + ' calls';
                                                        }

                                                        tooltip_str = '<center><b>' + key + '</b></center>' + y + ' on ' + x;
                                                        return tooltip_str;
                                                    });

                                                    d3.select('#lineWithFocusChart svg')
                                                        .datum(data_lineWithFocusChart)
                                                        .transition().duration(500)
                                                        .attr('height', 450)
                                                        .call(chart);

                                                    return chart;
                                                });

                                                data_lineWithFocusChart = [{
                                                    'values': dataTest,
                                                    'key': 'Hits',
                                                    'yAxis': '1'

                                                    }];

                                            }
                                        }
                                    }
                                }
                            }
                        }
                });

                if (length == 0) {
                    $('#resourcePathUsageTable').hide();
                    $('#tempLoadingSpaceResourcePath').html('');
                    $('#tempLoadingSpaceResourcePath').append($('<span class="label label-info">' + i18n.t('errorMsgs.noData') + '</span>'));

                } else {
                    $('#tableContainer').append($dataTable);
                    $('#chartContainer').append($('<div id="lineWithFocusChart"><svg style="height:450px;"></svg></div>'));
                    $('#tableContainer').show();
                    $('#resourcePathUsageTable').DataTable();
                }

            } else {
                if (json.message == "AuthenticateError") {
                    jagg.showLogin();
                } else {
                    jagg.message({content: json.message, type: "error"});
                }
            }
            t_on['tempLoadingSpaceResourcePath'] = 0;
        }, "json");

}

function isDataPublishingEnabled(){
    jagg.post("/site/blocks/stats/api-usage-resource-path/ajax/stats.jag", { action: "isDataPublishingEnabled"},
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
