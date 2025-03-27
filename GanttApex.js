public class GanttApex {
    public String selectedProgram { get; set; }
    public List<SelectOption> programOptions { get; set; }
    public String NameJSON { get; set; }
    public String SDateJSON { get; set; }
    public String EDateJSON { get; set; }
    public String OwnerJSON { get; set; }
    public String DurationJSON { get; set; }
    public String percentageJSON { get; set; }
    public String selectedDateRange { get; set; }
    public String startDateJSON { get; set; }
    public String endDateJSON { get; set; }
    public string projectIdJson {get; set;}
    
    public List<SelectOption> dateRangeOptions { get; set; }
    public Integer selectedYear { get; set; } // Add a new property for the year filter
    public List<SelectOption> yearOptions { get; set; } // Add a new property for year options
    
    public GanttApex() {
        programOptions = new List<SelectOption>();
        dateRangeOptions = new List<SelectOption>();
        yearOptions = new List<SelectOption>();
        
        List<Program__c> programs = [SELECT Id, Name FROM Program__c ORDER BY Name ASC];        
        Id defaultProgramId = null;
        for (Program__c program : programs) {
            programOptions.add(new SelectOption(program.Id, program.Name));
            if (program.Name == 'Accounts projects') {
                defaultProgramId = program.Id;
            }
        } 
        selectedProgram = defaultProgramId != null ? defaultProgramId : 'ALL'; // Default to 'ALL'
        dateRangeOptions.add(new SelectOption('ALL_TIME', 'All Time'));
        dateRangeOptions.add(new SelectOption('Q1', 'Q1'));
        dateRangeOptions.add(new SelectOption('Q2', 'Q2'));
        dateRangeOptions.add(new SelectOption('Q3', 'Q3'));
        dateRangeOptions.add(new SelectOption('Q4', 'Q4'));  
        selectedDateRange = 'ALL_TIME';
        
        // Populate year options
        yearOptions.add(new SelectOption('2024', '2024'));
        yearOptions.add(new SelectOption('2025', '2025'));
        selectedYear = System.today().year(); // Default to the current year
        
        loadProjects();
    }
    
    public void loadProjects() {
        String baseQuery = 'SELECT Id, Name,Kickoff_formula__c, Deadline_formula__c, Project_Owner__c,Percentage_Completion__c FROM Project__c';
        String filter = '';
        
        if (selectedProgram != null && selectedProgram != '' && selectedProgram != 'ALL') {
            filter += ' WHERE Program__c = :selectedProgram';
        }
        
        Date startDate;
        Date endDate;
        if (selectedDateRange != null) {
            switch on selectedDateRange {
                when 'Q4' {
                    startDate = Date.newInstance(System.today().year(), 1, 1);
                    endDate = Date.newInstance(System.today().year(), 3, 31);
                }
                when 'Q1' {
                    startDate = Date.newInstance(System.today().year(), 4, 1);
                    endDate = Date.newInstance(System.today().year(), 6, 30);
                }
                when 'Q2' {
                    startDate = Date.newInstance(System.today().year(), 7, 1);
                    endDate = Date.newInstance(System.today().year(), 9, 30);
                }
                when 'Q3' {
                    startDate = Date.newInstance(System.today().year(), 10, 1);
                    endDate = Date.newInstance(System.today().year(), 12, 31);
                }
                when 'ALL_TIME' {
                    startDate = Date.newInstance(System.today().year(), 1, 1);
                    endDate = Date.newInstance(System.today().year(), 12, 31);
                }
            }
            
            if (startDate != null && endDate != null) {
                filter += (filter.length() > 0 ? ' AND (' : ' WHERE (') +
                    '(Kickoff_formula__c >= :startDate AND Kickoff_formula__c <= :endDate) ' +
                    'OR (Deadline_formula__c >= :startDate AND Deadline_formula__c <= :endDate))';
            }
        }

        if (selectedYear != null) {
            filter += (filter.length() > 0 ? ' AND ' : ' WHERE ') +
                '(CALENDAR_YEAR(Kickoff_formula__c) = :selectedYear ' +
                'OR CALENDAR_YEAR(deadline_formula__c) = :selectedYear)';
        }
        
        String query = baseQuery + filter + ' ORDER BY Owner_s_Department__c ASC';
        List<Project__c> projectList = Database.query(query);    
        System.debug('Number of Projects Found: ' + projectList.size());
        List<String> Name = new List<String>();
        List<Date> SDate = new List<Date>();
        List<Date> EDate = new List<Date>();
        List<String> Owner = new List<String>();
        List<Integer> Duration = new List<Integer>();
        List<Integer> Percentage = new List<Integer>();
        List<String> IdProject = new list <String>();
        
        for (Project__c project : projectList) {
            Owner.add(project.Project_Owner__c);
            Date kickoffDate = project.Kickoff_formula__c;
            Date deadlineDate = project.Deadline_formula__c;          
            Name.add(project.Name);
            SDate.add(kickoffDate);
            EDate.add(deadlineDate);
            Integer duration1 = kickoffDate.daysBetween(deadlineDate);
            Duration.add(duration1);
            Percentage.add((Integer)project.Percentage_Completion__c);
            IdProject.add(project.Id);
        }
        NameJSON = JSON.serialize(Name);
        SDateJSON = JSON.serialize(SDate);
        EDateJSON = JSON.serialize(EDate);
        OwnerJSON = JSON.serialize(Owner);
        DurationJSON = JSON.serialize(Duration);
        percentageJSON = JSON.serialize(Percentage);
        startDateJSON = JSON.serialize(startDate);
        endDateJSON = JSON.serialize(endDate);
        projectIdJson = JSON.serialize(IdProject);
    }
    
    public void filterProjects() {
        loadProjects();
    }
}
