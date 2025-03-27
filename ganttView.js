<apex:page controller="GanttApex">
    <apex:form id="filterForm">
        <style type="text/css">
            /* General Styles */
            body {
                font-family: Arial, sans-serif;
                color: #333;
                margin: 20px;
                background-color: #f5f5f5;
            }

            h4 {
                color: #004b7f;
                text-align: center;
                font-size: 20px;
                margin: 0; /* Remove default margin */
            }

            .title {
                margin-bottom: 20px;
                padding: 10px;
                background-color: #f9f9f9;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .filter-container {
                margin-bottom: 20px;
                padding: 10px;
                border: 1px solid #ddd;
                background-color: #f9f9f9;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 20px; /* Space between elements */
                flex-wrap: wrap; /* Allows wrapping to new lines if needed */
            }

            .filter-container > div {
                display: flex;
                align-items: center;
                gap: 10px; /* Space between filter controls and button */
            }

            .filter-container select {
                padding: 10px;
                margin-right: 10px;
                border: 1px solid #ccc;
                border-radius: 4px;
                font-size: 16px; 
            }

            .filter-container .filter-button {
                padding: 12px 24px; /* Medium size padding */
                background: #004b7f; /* Dark blue background */
                color: white; /* White text color */
                border: none; /* No border */
                border-radius: 6px; /* Slightly more rounded corners */
                cursor: pointer; /* Pointer cursor on hover */
                font-size: 16px; /* Medium font size */
                font-weight: 600; /* Bold text */
                transition: background 0.3s, color 0.3s; /* Smooth transitions for background and text color */
                text-align: center; /* Center text inside the button */
                white-space: nowrap; 
            }

            .filter-container .filter-button:hover {
                background: #984a19; /* Orange background on hover */
                color: white; /* Dark blue text color on hover */
            }

            /* Legend Styles */
            .legend-container {
                display: flex;
                align-items: center;
                gap: 15px; /* Space between legend items */
            }

            .legend {
                display: flex;
                align-items: center;
                font-size: 14px;
            }

            .legend-color {
                width: 20px;
                height: 20px;
                margin-right: 5px;
                border-radius: 10px;
            }

            .chart-container {
                width: 100%;
                margin: 20px 0;
                padding: 10px;
                background: #fff;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                overflow: auto;
                position: relative;
                text-align: center; /* Center text inside the chart container */
            }

            #chart_div {
                width: 100%;
                height: 100%;
                position: relative;
            }

            .chart-container .tooltip {
                position: absolute;
                background: #fff;
                border: 1px solid #ddd;
                padding: 10px;
                border-radius: 5px;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
                pointer-events: none; /* Prevents tooltip from interfering with mouse events */
                display: none; /* Hidden by default */
                z-index: 1000; /* Make sure it's on top */
            }

            g path {
                fill: #008000;
                stroke: #008000;
                stroke-width: 0;
                transition: stroke-width 0.5s ease-in-out, fill 0.5s ease-in-out;
                border-radius: 25px;
            }

            g path:hover {
                fill: #abf7b1;
                stroke-width: 3;
                stroke-dasharray: 1000;
                stroke-dashoffset: 0;
                border-radius: 20px;
            }

            /* Text inside Gantt chart columns */
            g text {
                fill: black;
                font-family: Calibri;
                word-wrap: break-word;
                font-size: 10px;
            }

            /* Tooltip rectangle */
            g g rect {
                fill: #fff;
                border-radius: 30px;
                font-family: Calibri;
                word-wrap: break-word;
                font-size: 10px;
            }
        </style>

        <script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
        <script type="text/javascript">
            google.charts.load('current', { packages: ['gantt'] });
            google.charts.setOnLoadCallback(drawChart);

            function daysToMilliseconds(days) {
                return days * 24 * 60 * 60 * 1000;
            }

            function drawChart() {
                var data = new google.visualization.DataTable();
                data.addColumn('string', 'Task ID');
                data.addColumn('string', 'Task Name');
                data.addColumn('date', 'Start Date');
                data.addColumn('date', 'End Date');
                data.addColumn('number', 'Duration');
                data.addColumn('number', 'Percent Complete');
                data.addColumn('string', 'Dependencies');
                data.addColumn('string', 'URL');
                data.addColumn({ type: 'string', role: 'tooltip', p: { html: true } });

                var SystemsLeadArr = JSON.parse('{!JSENCODE(OwnerJSON)}');
                var NameArr = JSON.parse('{!JSENCODE(NameJSON)}');
                var startDateArr = JSON.parse('{!JSENCODE(SDateJSON)}');
                var endDateArr = JSON.parse('{!JSENCODE(EDateJSON)}');
                var durationArr = JSON.parse('{!JSENCODE(DurationJSON)}');
                var percentage = JSON.parse('{!JSENCODE(percentageJSON)}'); 
                var IdProject = JSON.parse('{!JSENCODE(projectIdJson)}'); 
                var startDate = JSON.parse('{!JSENCODE(startDateJSON)}');
                startDate = new Date(startDate);
                var endDate = JSON.parse('{!JSENCODE(endDateJSON)}');
                endDate = new Date(endDate);

                data.addRow([
                    '',
                    '',
                    startDate,
                    startDate,
                    0,
                    0,
                    null,
                    null,
                    ''
                ]);

                for (var i = 0; i < NameArr.length; i++) {
                    var start = Math.max(new Date(startDateArr[i]), startDate);
                    var sd = new Date(start);
                    var url = 'https://insert Your link here' + IdProject[i] + '/view';
                    var end = Math.min(new Date(endDateArr[i]), endDate);
                    var ed = new Date(end);

                    var tooltip = `
                        <div style="padding: 10px;">
                            <strong>Project Name:</strong> ${NameArr[i]}<br>
                            <strong>Start Date:</strong> ${sd.toDateString()}<br>
                            <strong>End Date:</strong> ${ed.toDateString()}<br>
                            <strong>Duration:</strong> ${durationArr[i]} days<br>
                            <strong>Completion:</strong> ${percentage[i]}%
                        </div>
                    `;

                    data.addRow([
                        NameArr[i],
                        NameArr[i],
                        sd,
                        ed,
                        daysToMilliseconds(durationArr[i]),
                        percentage[i],
                        null,
                        url,
                        tooltip
                    ]);
                }

                data.addRow([
                    null,
                    null,
                    endDate,
                    endDate,
                    0,
                    0,
                    null,
                    null,
                    ''
                ]);

                var options = {
                    height: 1000,
                    width: 1650,
                    gantt: {
                        trackHeight: 25,
                        barHeight: 20,
                        innerGridTrack: { fill: '#ffffff' },
                        innerGridDarkTrack: { fill: '#dedede' },
                        barCornerRadius: 15,
                        criticalPathEnabled: false,
                        labelStyle: {
                            fontName: 'Arial',
                            fontSize: 11,
                            color: 'red'
                        },
                        barLabelStyle: { fontName: 'Arial', fontSize: 12, color: '#555' }
                    },
                    tooltip: { isHtml: true }
                };

                var chart = new google.visualization.Gantt(document.getElementById('chart_div'));
                chart.draw(data, options);

                google.visualization.events.addListener(chart, 'select', function() {
                    var selection = chart.getSelection();
                    if (selection.length > 0) {
                        var row = selection[0].row;
                        var url = data.getValue(row, 7);
                        if (url) {
                            window.open(url, '_blank');
                        }
                    }
                });
            }

            function updateChart() {
                document.getElementById('filterForm').submit();
            }
        </script>

        <div class="title">
            <h4>Project Gantt Chart</h4>
        </div>
        <div class="filter-container">
            <div>
                <apex:selectList value="{!selectedProgram}" size="1" onchange="updateChart()">
                    <apex:selectOptions value="{!programOptions}" />
                </apex:selectList>
                <apex:selectList value="{!selectedDateRange}" size="1" onchange="updateChart()">
                    <apex:selectOptions value="{!dateRangeOptions}" />
                </apex:selectList>
                <apex:selectList value="{!selectedYear}" size="1" onchange="updateChart()">
                    <apex:selectOptions value="{!yearOptions}" />
                </apex:selectList>
                <apex:commandButton value="Filter" action="{!filterProjects}" onclick="updateChart(); return false;" styleClass="filter-button" />
            </div>
            <div class="legend-container">
                <div class="legend">
                    <div class="legend-color" style="background-color: #008000;"></div>
                    <span>Complete</span>
                </div>
                <div class="legend">
                    <div class="legend-color" style="background-color: #6597F4;"></div>
                    <span>In Progress/Started</span>
                </div>
            </div>
        </div>

        <div class="chart-container">
            <div id="chart_div"></div>
        </div>
    </apex:form>
</apex:page>
