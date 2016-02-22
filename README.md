KnackHQ import records from Google Sheets
==============

This script fetches data from a google sheet and posts into KnackHQ objects which may or may not have connected fields.
For posting into connected fields you will have to provide the field of the object that it is related to.
This does not use any authentication as of now and can only fetch data from a published google sheet.

You can view a demo at: https://www.youtube.com/watch?v=Ng1scDCFgu8

**Script Functions**
--------------

- Imports data from google sheets.
- Can insert into connected objects.

**Script Requirements**
--------------

- You have to provide the fields in the connected objects.


**Script Functions yet to be implemented**
--------------

- Implementing using Google Sheets API.
- Saving rules for object transformations for further use.
- Scheduling for automatic posting data.
- Correction of wrong records.
