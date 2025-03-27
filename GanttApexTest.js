@isTest
public class GanttApexTest {
    
    @isTest
    static void testLoadProjects() {
        List<Program__c> programs = new List<Program__c>{
            new Program__c(Name='Accounts projects'),
                new Program__c(Name='Marketing projects')
                };
                    insert programs;
        
        List<Project__c> projects = new List<Project__c>{
            new inov8__PMT_Project__c(
                Name = 'Project 1',
                Program__c = programs[0].Id,
                Level_of_Effort__c = 'Small',
                Initial_End_Date__c = Date.newInstance(2024, 6, 23),
                Initial_Start_Date__c = Date.newInstance(2024, 6, 12)
            )
                };
                    insert projects;
        
        GanttApex controller = new GanttApex();
        
        controller.selectedDateRange = 'Q1'; 
        Test.startTest();
        controller.filterProjects();
        Test.stopTest();         
        List<String> names = (List<String>)JSON.deserialize(controller.NameJSON, List<String>.class);
        System.assertEquals('Project 1', names[0], 'Project in Q1 should be "Project 1"'); 
        names = (List<String>)JSON.deserialize(controller.NameJSON, List<String>.class);
        System.assertEquals(1, names.size(), 'Both projects should be included for ALL_TIME');
        System.assertEquals('Project 1', names[0], 'First project should be "Project 1" for ALL_TIME');
    }
}
