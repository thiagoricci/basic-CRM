# Search & Filtering Feature - Visual Diagrams

## 1. System Architecture Overview

```mermaid
graph TB
    subgraph "User Interface Layer"
        User[User]
        Nav[Navigation Component]
        GlobalSearch[Global Search Bar]
        ListPages[List Pages]
    end

    subgraph "Search Components"
        SearchDropdown[Search Results Dropdown]
        SearchHistory[Search History]
        AdvancedFilters[Advanced Filter Builder]
        SavedFilters[Saved Filters]
    end

    subgraph "API Layer"
        SearchAPI[/api/search]
        ContactsAPI[/api/contacts]
        CompaniesAPI[/api/companies]
        DealsAPI[/api/deals]
        TasksAPI[/api/tasks]
        ActivitiesAPI[/api/activities]
    end

    subgraph "Data Layer"
        Prisma[Prisma ORM]
        Database[(PostgreSQL)]
    end

    subgraph "Client Storage"
        LocalStorage[localStorage]
        URLParams[URL Parameters]
    end

    User --> Nav
    User --> ListPages
    Nav --> GlobalSearch
    ListPages --> AdvancedFilters
    ListPages --> SavedFilters

    GlobalSearch --> SearchDropdown
    GlobalSearch --> SearchHistory
    SearchHistory --> LocalStorage

    GlobalSearch --> SearchAPI
    AdvancedFilters --> ContactsAPI
    AdvancedFilters --> CompaniesAPI
    AdvancedFilters --> DealsAPI
    AdvancedFilters --> TasksAPI
    AdvancedFilters --> ActivitiesAPI

    ListPages --> URLParams
    URLParams --> ListPages

    SearchAPI --> Prisma
    ContactsAPI --> Prisma
    CompaniesAPI --> Prisma
    DealsAPI --> Prisma
    TasksAPI --> Prisma
    ActivitiesAPI --> Prisma

    Prisma --> Database
```

## 2. Global Search Flow

```mermaid
sequenceDiagram
    participant User
    participant GlobalSearch
    participant SearchAPI
    participant Database
    participant SearchDropdown

    User->>GlobalSearch: Press Ctrl+K / Cmd+K
    GlobalSearch->>GlobalSearch: Open search bar
    User->>GlobalSearch: Type "John"
    GlobalSearch->>GlobalSearch: Wait 300ms (debounce)
    GlobalSearch->>SearchAPI: GET /api/search?q=John&limit=5
    SearchAPI->>Database: Query contacts, companies, deals, tasks
    Database-->>SearchAPI: Return results
    SearchAPI-->>GlobalSearch: Return grouped results
    GlobalSearch->>SearchDropdown: Display results
    SearchDropdown-->>User: Show grouped results
    User->>SearchDropdown: Navigate with arrow keys
    User->>SearchDropdown: Press Enter on "John Doe"
    SearchDropdown->>User: Navigate to /contacts/{id}
    GlobalSearch->>GlobalSearch: Save "John" to search history
    GlobalSearch->>GlobalSearch: Close search bar
```

## 3. Advanced Filter Builder Flow

```mermaid
graph LR
    subgraph "Filter Builder UI"
        AddBtn[Add Condition]
        Operator[AND/OR Operator]
        Conditions[Filter Conditions]
        ApplyBtn[Apply Filters]
        ClearBtn[Clear All]
    end

    subgraph "Filter Condition"
        Field[Field Select]
        Operator[Operator Select]
        Value[Value Input]
        Remove[Remove Button]
    end

    subgraph "Filter State"
        FilterState[Advanced Filters Object]
    end

    subgraph "API"
        FilterAPI[Apply Filters to API]
    end

    AddBtn --> Conditions
    Conditions --> Field
    Conditions --> Operator
    Conditions --> Value
    Conditions --> Remove
    Remove --> Conditions

    Conditions --> FilterState
    Operator --> FilterState
    FilterState --> ApplyBtn
    ApplyBtn --> FilterAPI
    ClearBtn --> FilterState
```

## 4. Saved Filters Flow

```mermaid
graph TB
    subgraph "User Actions"
        SaveBtn[Save Filter]
        LoadBtn[Load Filter]
        DeleteBtn[Delete Filter]
    end

    subgraph "Saved Filters UI"
        SaveDialog[Save Filter Dialog]
        FilterName[Filter Name Input]
        SavedList[Saved Filters List]
        FilterItem[Filter Item]
    end

    subgraph "Client Storage"
        LocalStorage[localStorage]
    end

    subgraph "Application State"
        CurrentFilters[Current Filters]
        SavedFilters[Saved Filters Array]
    end

    SaveBtn --> SaveDialog
    SaveDialog --> FilterName
    FilterName --> LocalStorage
    LocalStorage --> SavedFilters
    SavedFilters --> SavedList
    SavedList --> FilterItem

    FilterItem --> LoadBtn
    LoadBtn --> CurrentFilters
    CurrentFilters --> ListPages

    FilterItem --> DeleteBtn
    DeleteBtn --> LocalStorage
    LocalStorage --> SavedFilters
```

## 5. URL Parameter Sync Flow

```mermaid
graph TB
    subgraph "User Interaction"
        UserAction[User Changes Filter]
    end

    subgraph "Filter State"
        FilterState[Filter State Object]
    end

    subgraph "URL Sync"
        Encode[Encode to URL Params]
        RouterPush[Update URL]
    end

    subgraph "Browser"
        URL[Browser URL]
        BackBtn[Back/Forward Button]
    end

    subgraph "URL Parse"
        Parse[Parse URL Params]
        Decode[Decode to Filters]
    end

    UserAction --> FilterState
    FilterState --> Encode
    Encode --> RouterPush
    RouterPush --> URL

    BackBtn --> URL
    URL --> Parse
    Parse --> Decode
    Decode --> FilterState
```

## 6. Component Hierarchy

```mermaid
graph TB
    subgraph "Navigation"
        Navigation[Navigation Component]
        GlobalSearch[Global Search Bar]
    end

    subgraph "Search Components"
        SearchDropdown[Search Results Dropdown]
        SearchResults[Search Results]
        SearchItem[Search Result Item]
        SearchHistory[Search History]
    end

    subgraph "Filter Components"
        BasicFilters[Basic Filters]
        AdvancedFilters[Advanced Filter Builder]
        FilterCondition[Filter Condition]
        FilterField[Filter Field Select]
        FilterOperator[Filter Operator Select]
        FilterValue[Filter Value Input]
    end

    subgraph "Saved Filters"
        SavedDropdown[Saved Filters Dropdown]
        SaveDialog[Save Filter Dialog]
        SavedList[Saved Filters List]
        SavedItem[Saved Filter Item]
    end

    Navigation --> GlobalSearch
    GlobalSearch --> SearchDropdown
    SearchDropdown --> SearchResults
    SearchResults --> SearchItem
    GlobalSearch --> SearchHistory

    BasicFilters --> AdvancedFilters
    AdvancedFilters --> FilterCondition
    FilterCondition --> FilterField
    FilterCondition --> FilterOperator
    FilterCondition --> FilterValue

    BasicFilters --> SavedDropdown
    SavedDropdown --> SaveDialog
    SavedDropdown --> SavedList
    SavedList --> SavedItem
```

## 7. Data Flow Diagram

```mermaid
graph LR
    subgraph "User Input"
        Search[Search Query]
        Filters[Filter Conditions]
        Sort[Sort Options]
    end

    subgraph "Client Processing"
        Debounce[Debounce 300ms]
        Validate[Validate Input]
        EncodeURL[Encode URL Params]
        SaveHistory[Save to History]
    end

    subgraph "API Request"
        APIEndpoint[API Endpoint]
        QueryParams[Query Parameters]
    end

    subgraph "Server Processing"
        PrismaQuery[Prisma Query]
        Database[Database Query]
        Results[Query Results]
    end

    subgraph "Response"
        Response[JSON Response]
        Error[Error Handling]
    end

    subgraph "Client Display"
        UpdateUI[Update UI]
        ShowResults[Display Results]
        ShowError[Show Error Message]
    end

    Search --> Debounce
    Filters --> Validate
    Sort --> Validate

    Debounce --> APIEndpoint
    Validate --> EncodeURL
    EncodeURL --> QueryParams
    QueryParams --> APIEndpoint

    APIEndpoint --> PrismaQuery
    PrismaQuery --> Database
    Database --> Results
    Results --> Response

    Response --> UpdateUI
    UpdateUI --> ShowResults
    Error --> ShowError

    Search --> SaveHistory
```

## 8. Filter State Management

```mermaid
stateDiagram-v2
    [*] --> Initial
    Initial --> Loading: User changes filter
    Loading --> Success: API returns results
    Loading --> Error: API error
    Success --> Loading: User changes filter
    Error --> Initial: User clears filter
    Success --> Initial: User clears filter
    Error --> Loading: User retries
```

## 9. Global Search Keyboard Navigation

```mermaid
graph TB
    subgraph "Keyboard Shortcuts"
        CtrlK[Ctrl+K / Cmd+K]
        Escape[Escape]
        ArrowUp[Arrow Up]
        ArrowDown[Arrow Down]
        Enter[Enter]
    end

    subgraph "Actions"
        OpenSearch[Open Search Bar]
        CloseSearch[Close Search Bar]
        NavigateUp[Navigate Up]
        NavigateDown[Navigate Down]
        SelectResult[Select Result]
    end

    subgraph "UI States"
        Closed[Search Closed]
        Open[Search Open]
        ResultFocused[Result Focused]
    end

    CtrlK --> OpenSearch
    OpenSearch --> Open
    Escape --> CloseSearch
    CloseSearch --> Closed

    ArrowUp --> NavigateUp
    NavigateUp --> ResultFocused
    ArrowDown --> NavigateDown
    NavigateDown --> ResultFocused

    Enter --> SelectResult
    SelectResult --> Closed

    Open --> ArrowUp
    Open --> ArrowDown
    Open --> Enter
    Open --> Escape
```

## 10. Implementation Phases Timeline

```mermaid
gantt
    title Search & Filtering Implementation Timeline
    dateFormat  YYYY-MM-DD
    section Phase 1
    Global Search API           :p1a, 2026-01-02, 2d
    Global Search Component      :p1b, after p1a, 3d
    Search History             :p1c, after p1a, 1d
    Integration                :p1d, after p1b p1c, 1d

    section Phase 2
    URL Sync Utilities         :p2a, 2026-01-02, 2d
    URL Parse Implementation   :p2b, after p2a, 2d
    Browser Nav Testing       :p2c, after p2b, 1d

    section Phase 3
    Enhanced Filters          :p3a, 2026-01-05, 3d
    Filter State Management   :p3b, after p3a, 2d
    Clear All Button         :p3c, after p3b, 1d

    section Phase 4
    Advanced Filter Builder  :p4a, 2026-01-08, 4d
    AND/OR Logic           :p4b, after p4a, 2d
    Dynamic UI             :p4c, after p4b, 2d

    section Phase 5
    Saved Filters UI        :p5a, 2026-01-12, 3d
    localStorage Management  :p5b, after p5a, 2d
    Default Filters        :p5c, after p5b, 1d

    section Phase 6
    Database Indexes        :p6a, 2026-01-15, 2d
    Performance Testing     :p6b, after p6a, 3d
    Polish & Bug Fixes     :p6c, after p6b, 2d
```

## 11. Entity Relationship Diagram for Filters

```mermaid
erDiagram
    CONTACT ||--o{ ACTIVITY : has
    CONTACT ||--o{ TASK : has
    CONTACT ||--o{ DEAL : has
    CONTACT }o--|| COMPANY : belongs_to

    COMPANY ||--o{ CONTACT : has
    COMPANY ||--o{ DEAL : has

    DEAL ||--|| CONTACT : belongs_to
    DEAL }o--|| COMPANY : belongs_to

    TASK ||--|| CONTACT : belongs_to

    ACTIVITY ||--|| CONTACT : belongs_to

    CONTACT {
        uuid id PK
        string first_name
        string last_name
        string email
        string phone_number
        string status
        uuid company_id FK
        timestamp created_at
    }

    COMPANY {
        uuid id PK
        string name
        string industry
        string website
        string phone
        string address
        int employee_count
        float revenue
        timestamp created_at
    }

    DEAL {
        uuid id PK
        string name
        float value
        string stage
        timestamp expected_close_date
        timestamp actual_close_date
        string status
        int probability
        uuid contact_id FK
        uuid company_id FK
        timestamp created_at
    }

    TASK {
        uuid id PK
        string title
        string description
        timestamp due_date
        string priority
        boolean completed
        timestamp completed_at
        uuid contact_id FK
        timestamp created_at
    }

    ACTIVITY {
        uuid id PK
        string type
        string subject
        string description
        uuid contact_id FK
        timestamp created_at
    }
```

## 12. Database Index Strategy

```mermaid
graph TB
    subgraph "Contacts Table"
        C1[idx_contacts_email]
        C2[idx_contacts_status]
        C3[idx_contacts_created_at]
        C4[idx_contacts_phone_number]
        C5[idx_contacts_company_id]
        C6[idx_contacts_full_name]
        C7[idx_contacts_status_company]
    end

    subgraph "Companies Table"
        Co1[idx_companies_name]
        Co2[idx_companies_industry]
        Co3[idx_companies_name_pattern]
        Co4[idx_companies_website_pattern]
    end

    subgraph "Deals Table"
        D1[idx_deals_contact_id]
        D2[idx_deals_company_id]
        D3[idx_deals_stage]
        D4[idx_deals_status]
        D5[idx_deals_expected_close_date]
        D6[idx_deals_actual_close_date]
        D7[idx_deals_name_pattern]
        D8[idx_deals_description_pattern]
        D9[idx_deals_stage_status]
    end

    subgraph "Tasks Table"
        T1[idx_tasks_contact_id]
        T2[idx_tasks_due_date]
        T3[idx_tasks_completed]
        T4[idx_tasks_priority]
        T5[idx_tasks_title_pattern]
        T6[idx_tasks_description_pattern]
        T7[idx_tasks_completed_priority]
    end

    subgraph "Activities Table"
        A1[idx_activities_contact_id]
        A2[idx_activities_created_at]
        A3[idx_activities_type]
        A4[idx_activities_type_created]
    end
```

## 13. Search Performance Optimization

```mermaid
graph LR
    subgraph "Search Query"
        Query[User Query]
    end

    subgraph "Optimization Layers"
        Debounce[Debounce 300ms]
        Cache[Check Cache]
        Index[Use Indexes]
        Limit[Limit Results]
    end

    subgraph "Database"
        Query1[Query 1: Contacts]
        Query2[Query 2: Companies]
        Query3[Query 3: Deals]
        Query4[Query 4: Tasks]
    end

    subgraph "Response"
        Results[Combined Results]
    end

    Query --> Debounce
    Debounce --> Cache
    Cache -->|Cache Hit| Results
    Cache -->|Cache Miss| Index
    Index --> Limit
    Limit --> Query1
    Limit --> Query2
    Limit --> Query3
    Limit --> Query4
    Query1 --> Results
    Query2 --> Results
    Query3 --> Results
    Query4 --> Results
```

## 14. User Experience Flow - Complete Workflow

```mermaid
flowchart TD
    Start([User Starts]) --> Navigate{Navigate to Page}
    Navigate --> Contacts[Contacts Page]
    Navigate --> Companies[Companies Page]
    Navigate --> Deals[Deals Page]
    Navigate --> Tasks[Tasks Page]
    Navigate --> Activities[Activities Page]

    Contacts --> SearchOrFilter{Search or Filter?}
    Companies --> SearchOrFilter
    Deals --> SearchOrFilter
    Tasks --> SearchOrFilter
    Activities --> SearchOrFilter

    SearchOrFilter --> GlobalSearch[Use Global Search Ctrl+K]
    SearchOrFilter --> PageSearch[Use Page Search]
    SearchOrFilter --> Advanced[Use Advanced Filters]
    SearchOrFilter --> Saved[Use Saved Filter]

    GlobalSearch --> Type[Type Query]
    Type --> Results[View Results]
    Results --> Select[Select Result]
    Select --> Profile[View Profile]

    PageSearch --> Enter[Enter Search Term]
    Enter --> FilterResults[View Filtered Results]
    FilterResults --> SaveFilter{Save Filter?}
    SaveFilter -->|Yes| Name[Name Filter]
    SaveFilter -->|No| Share{Share Link?}
    Name --> SavedFilters[Saved to localStorage]

    Advanced --> AddCondition[Add Condition]
    AddCondition --> SelectField[Select Field]
    SelectField --> SelectOperator[Select Operator]
    SelectOperator --> EnterValue[Enter Value]
    EnterValue --> MoreConditions{More Conditions?}
    MoreConditions -->|Yes| AddCondition
    MoreConditions -->|No| Apply[Apply Filters]
    Apply --> ViewAdvanced[View Results]

    Saved --> SelectSaved[Select Saved Filter]
    SelectSaved --> Load[Load Filter]
    Load --> ViewSaved[View Results]

    Share -->|Yes| CopyURL[Copy URL]
    Share -->|No| Modify{Modify Filters?}
    CopyURL --> End([Done])
    Modify --> SearchOrFilter

    Profile --> End
    ViewAdvanced --> End
    ViewSaved --> End
    FilterResults --> End
```

## Summary

These diagrams provide visual representations of:

1. **System Architecture**: Overall component relationships
2. **Global Search Flow**: Step-by-step search interaction
3. **Advanced Filter Builder**: Filter condition management
4. **Saved Filters Flow**: Save/load/delete workflow
5. **URL Parameter Sync**: URL state management
6. **Component Hierarchy**: Component structure
7. **Data Flow**: Request/response lifecycle
8. **Filter State Management**: State transitions
9. **Keyboard Navigation**: Shortcut handling
10. **Implementation Timeline**: Phase-by-phase schedule
11. **Entity Relationships**: Database schema
12. **Index Strategy**: Database optimization
13. **Performance Optimization**: Query optimization layers
14. **Complete User Flow**: End-to-end user journey

These diagrams complement the detailed architecture document and provide visual context for implementation.
