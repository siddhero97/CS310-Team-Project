# AST @Siddhartha

This directory contains helper code for the project. AST stands for Abstract Syntax tree. 
It is a tree-version of the EBNF. 
https://en.wikipedia.org/wiki/Abstract_syntax_tree \
To make my code easier to understand and maintain, I tried to increase both encapsulation and abstraction. 

We make an assumption that the query is valid in all regards. This class does not handle cases in which  ResultTooLargeError is thrown. 
## AST-ValidatorFilter
Represents the filters of the provided EBNF of the course. 


### Fields Of AST:
#### 1. sections
* Purpose: Contains all the sections of the courses that the particular query requires.
* Assumptions: \
  (1) Only the sections associated with a valid id are provided \
  (2) All the required secions associated are provided \
  (3) All the required data is provided \
  (4) Sections is initialized; neither null nor undefined.
* Type: Array Of ISection 


#### Methods
##### convert
Purpose: Extract the extraFilters and components which will making filtering more encapsulated. This is so that abstraction is easier later on. \
Field: filterObject: the components of where from which to extract \
Returns: void - Shouldn't return anything.
##### performFilter
Purpose: Do the actual filtering \
Field: 
* booleanArray : an array of booleans corresponding to the filtered data. True: filter passes , False : filter fails  (May not be necesssary) #TODO: remove if not needed
* section1 (Optional) : used if and only if a certain section needs to be filtered


#### AST ValidatorFilter 1 : IS_FILTER
###  Fields
expectedValue: string //  the value we want to filter for. \
containsAsterix: boolean // if this is true than the expectedValue contains an asterix within \
field: string // the field that we want to filter for \
withoutAsterix: string // expectedValue without any asterix within \
firstAsterix: boolean //is true if and only if there is an asterix at the front of expectedValue \
lastAsterix: boolean // is true if and only if there is an asterix at the end of expectedValue

###  Methods
#### 1. Convert
extract all the fields for this particular function
#### 2. CustomFunction
extract the value from a particular section:

if the expectedValue doesn't contain asterix simply compare with the extract \
if the expectedValue contains asterix compares withoutAsterix with the middle, beginning or end portion of expectedValue. This is dependent on where the asterix is placed. Note: This particular case is dealt with using a helper function called filterAsterix.


#### AST ValidatorFilter 2 : LCComparision
###  Fields
expectedValue: string //  the value we want to filter for. \
field: string // the field that we want to filter for 
###  Methods
#### 1. Convert
extract field and expectedValue


#### AST ValidatorFilter 3 : LCComparision 1 : EQ
#### 1. CustomFunction
extract the value from a particular section: \
checks whether the expectedValue is equal to actualValue 

#### AST ValidatorFilter 4 : LCComparision 2 : GT
#### 1. CustomFunction
extract the value from a particular section: \
checks whether the actualValue is greater than expectedValue

#### AST ValidatorFilter 5 : LCComparision 3 : LT
#### 1. CustomFunction
extract the value from a particular section: \
checks whether the actualValue is less than expectedValue
## Project commands

Once your environment is configured you need to further prepare the project's tooling and dependencies.
In the project folder:

1. `yarn install` to download the packages specified in your project's *package.json* to the *node_modules* directory.

1. `yarn build` to compile your project. You must run this command after making changes to your TypeScript files.

1. `yarn test` to run the test suite.

## Running and testing from an IDE

WebStorm should be automatically configured the first time you open the project (WebStorm is a free download through their students program). For other IDEs and editors, you'll want to set up test and debug tasks and specify that the schema of all files in `test/queries` should follow `test/query.schema.json`.
