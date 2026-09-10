# JeevRakshak Health Hub

JEEVRAKSHAK — MASTER PRODUCTION UPGRADE PROMPT

IMPORTANT:

I am providing you with the EXISTING JeevRakshak source code/repository.

This is NOT a request to build a new application from scratch.

The current project was created as an SIH prototype/demo and was partially built using AI tools. The SIH is now finished. The project has several bugs, incomplete backend functionality, mock/demo behavior, and an AI system that appears to return the same result repeatedly instead of genuinely analyzing the user's input.

Your task is to transform this EXISTING JeevRakshak project into a REAL, WORKING, SCALABLE web application.

============================================================

0. GOLDEN RULES

============================================================

1. DO NOT rebuild the entire website from scratch.

2. DO NOT replace the existing frontend with a new template.

3. DO NOT unnecessarily change the current UI/UX.

4. KEEP the existing JeevRakshak visual identity.

5. KEEP the existing navigation and page structure wherever possible.

6. KEEP all already-working features.

7. FIX broken features instead of deleting them.

8. REMOVE SIH/demo-specific content.

9. REMOVE fake/mock functionality from production flows.

10. MAKE THE AI ACTUALLY PROCESS USER INPUT.

11. DO NOT use hardcoded AI answers.

12. DO NOT claim something is working unless you actually test it.

The existing UI/UX is important.

The goal is:

EXISTING JEEVRAKSHAK

        ↓

BUG FIXING

        ↓

REAL BACKEND

        ↓

REAL DATABASE

        ↓

REAL IMAGE STORAGE

        ↓

REAL AI

        ↓

REAL USER FLOWS

        ↓

PRODUCTION-READY JEEVRAKSHAK

============================================================

1. FIRST: FULL PROJECT AUDIT

============================================================

Before making major changes, inspect the entire repository.

Understand the current:

- frontend

- backend/server

- database

- Drizzle schema

- API routes

- authentication

- image upload system

- AI implementation

- emergency reporting

- doctor/veterinarian workflow

- farmer/pet-owner workflow

- animal records

- vaccination records

- medical records

- notifications

- location handling

- environment variables

- deployment configuration

- dependencies

- existing mock data

- hardcoded responses

- TODOs

- broken routes

- console errors

- server errors

Inspect the actual code before deciding what needs to be changed.

Do not assume that something is missing.

Reuse existing working code wherever possible.

============================================================

2. REMOVE THE SIH DEMO COMPLETELY

============================================================

The SIH competition/demo is finished.

Remove all user-facing SIH/demo/prototype-specific content.

Remove things such as:

- SIH references

- Smart India Hackathon references

- hackathon labels

- SIH demo badges

- prototype labels

- hackathon presentation text

- demo banners

- temporary test notices

- "SIH Demo"

- "Prototype"

- fake demonstration data

- fake demo requests

- fake sample AI results

- competition-specific UI elements

The final website should look like a real independent product.

The website should simply be:

JeevRakshak

DO NOT remove the actual JeevRakshak functionality.

Convert useful prototype features into real working features.

============================================================

LOGIN / ENTRY PAGE — 3 USER OPTIONS

============================================================

Create/modify the JeevRakshak entry/login page while keeping the EXISTING UI/UX style.

The first screen should clearly provide THREE options:

1. FARMER / PET OWNER

2. DOCTOR / VETERINARIAN

3. HELP AN ANIMAL WITHOUT LOGIN

Do NOT create three completely different websites.

Use the existing JeevRakshak design language and make these three options feel like part of the same application.

------------------------------------------------------------

OPTION 1 — FARMER / PET OWNER

------------------------------------------------------------

When the user selects:

"Farmer / Pet Owner"

show the authentication flow:

Login

Register

Forgot Password if supported

After successful login, open the Farmer/Pet Owner dashboard.

The dashboard should contain the existing JeevRakshak features plus:

- My Animals

- Add Animal

- Animal Profiles

- Vaccination Records

- Past Medical Records

- AI Health Assistant

- Emergency Assistance

- Previous Requests

- Notifications

The user must be able to manage their livestock/pets and their records.

------------------------------------------------------------

OPTION 2 — DOCTOR / VETERINARIAN

------------------------------------------------------------

When the user selects:

"Doctor / Veterinarian"

show the appropriate login/authentication flow.

After login, open the existing Doctor/Veterinarian dashboard.

KEEP THE EXISTING DOCTOR/VET REQUEST WORKFLOW.

Doctors/veterinarians should be able to:

- receive animal emergency requests

- view incoming requests

- view animal information

- view uploaded animal images

- view symptoms

- view problem description

- view location when appropriate

- accept/reject requests

- update request status

- add medical notes

- provide recommendations

- view authorized past records

Do not replace the current doctor/vet UI unnecessarily.

------------------------------------------------------------

OPTION 3 — HELP AN ANIMAL WITHOUT LOGIN

------------------------------------------------------------

This option MUST NOT require registration or login.

A person may encounter an injured or sick animal in public and want to help.

Example:

User sees injured dog

↓

Clicks "Help an Animal"

↓

Camera / Upload Photo

↓

Actual image preview appears

↓

Select animal type

↓

Describe what is wrong

↓

Share location

↓

AI preliminary assessment

↓

Submit emergency request

↓

Veterinarian/doctor can receive the request

The user should NOT be forced to create an account.

The user should be able to complete the emergency report as a guest.

If the existing application already has a similar emergency-reporting flow, REUSE IT rather than rebuilding it.

------------------------------------------------------------

LOGIN PAGE DESIGN

------------------------------------------------------------

The three options should be visually clear.

For example, three cards/buttons:

[ Farmer / Pet Owner ]

Manage your animals and health records

[ Doctor / Veterinarian ]

Manage and respond to animal cases

[ Help an Animal ]

Report an injured animal without login

Use the EXISTING JeevRakshak colors, typography, cards, icons, spacing and visual style.

Do not introduce a completely new design system.

Make the page responsive for:

- desktop

- tablet

- mobile

------------------------------------------------------------

IMPORTANT

------------------------------------------------------------

The "Help an Animal" option is NOT another user account type.

It is a PUBLIC emergency flow.

Therefore:

Farmer/Pet Owner

→ Authentication required

Doctor/Veterinarian

→ Authentication required

Help an Animal

→ NO LOGIN REQUIRED

============================================================

3. PRESERVE THE EXISTING UI/UX

============================================================

DO NOT redesign the website.

Keep:

- current colors

- current fonts

- current cards

- current buttons

- current navbar

- current sidebar

- current layouts

- current pages

- current icons

- current animations

- current spacing

- current responsive behavior

- current branding

- current overall visual style

Only modify UI when necessary to make a feature functional.

For example:

If image upload is broken, fix the upload UI.

If AI results need to be displayed properly, improve only the AI result component.

Do NOT replace the entire frontend.

============================================================

4. CURRENT MAJOR BUG — REPORTING A CASE SHOWS "NETWORK ERROR"

============================================================

There is currently a critical bug.

When the user reports an animal case, the frontend displays:

"Network Error"

Find the REAL ROOT CAUSE.

Do not hide the error.

Trace the entire request:

Frontend

↓

API request

↓

Server

↓

Route

↓

Validation

↓

Authentication

↓

Image upload if applicable

↓

Database

↓

Response

↓

Frontend state update

Check all of these:

- incorrect API URL

- wrong environment variables

- localhost URL in production

- frontend/backend port mismatch

- CORS

- missing route

- incorrect HTTP method

- malformed request

- JSON/FormData mismatch

- image upload failure

- authentication failure

- expired token

- database failure

- validation failure

- server crash

- malformed response

- deployment configuration

Use actual browser/network logs and server logs.

Fix the ROOT CAUSE.

After fixing it, test:

User submits report

→ API request succeeds

→ server receives it

→ database stores it

→ image is stored if present

→ successful response returned

→ UI updates

→ request appears in the correct dashboard.

============================================================

5. IMAGE UPLOAD — MUST ACTUALLY WORK

============================================================

This is a critical requirement.

Whenever a user selects or takes an animal image:

THE ACTUAL IMAGE MUST APPEAR IN THE UI.

Do NOT only display:

"image.jpg"

The user must see the real image preview.

Required behavior:

Select image

↓

Image preview appears immediately

↓

User can remove image

↓

User can replace image

↓

User submits

↓

Image is uploaded to persistent storage

↓

Database stores image reference/URL

↓

Record is created

↓

Image remains available

The image MUST remain visible after:

- page refresh

- logout/login

- reopening the animal

- reopening emergency request

- reopening medical record

- doctor/vet viewing request

- AI analysis history

Do NOT use temporary browser object URLs as permanent storage.

Use a proper persistent storage mechanism supported by the current architecture.

============================================================

6. IMAGE UPLOAD MUST WORK EVERYWHERE

============================================================

Use a reusable image-upload service/component.

Support existing relevant features such as:

- emergency animal photo

- AI animal analysis

- animal profile photo

- medical records

- doctor/veterinarian requests

- other existing image upload features

Required:

- image preview

- upload progress

- loading state

- upload error

- retry

- remove image

- replace image

- file type validation

- reasonable file size validation

- broken image fallback

Test:

Upload

→ Preview

→ Submit

→ Storage

→ Database

→ Refresh

→ Reopen

→ Image still visible.

============================================================

7. MAKE JEEVRAKSHAK AI REAL

============================================================

THIS IS EXTREMELY IMPORTANT.

The current AI appears to return the same result again and again.

That behavior MUST be removed.

Search the project for:

- hardcoded AI responses

- mock AI responses

- static diagnosis

- predefined result strings

- fake analysis

- placeholder responses

- keyword-based fake responses

- random responses pretending to be AI

Remove these from the production AI flow.

The AI must receive and process the ACTUAL user input.

The result should depend on:

- user's question

- animal type

- animal information

- symptoms

- description

- uploaded image

- conversation history where appropriate

If the user changes the image or symptoms, the AI should analyze the new input.

DO NOT simply select a different hardcoded response based on keywords.

============================================================

8. AI ARCHITECTURE

============================================================

Implement a proper backend AI service.

Architecture:

Frontend

    ↓

Backend AI API

    ↓

AI Service

    ↓

AI Provider / Model

    ↓

Structured AI response

    ↓

Frontend

API keys MUST remain on the server.

Never expose AI keys in:

- React code

- browser JavaScript

- public environment variables

- GitHub

- HTML

Use server-side environment variables.

Create/update:

.env.example

but NEVER place real secrets in it.

============================================================

9. "TRAIN" THE AI FOR JEEVRAKSHAK

============================================================

I want the AI to be more specialized for JeevRakshak.

Do NOT attempt to train a huge model from scratch.

Instead, implement a practical veterinary knowledge layer.

Build a JeevRakshak Veterinary Knowledge Base / RAG-style architecture.

The knowledge layer should cover HIGH-LEVEL, RELIABLE INFORMATION about:

- common dog health problems

- common livestock health problems

- cattle health problems

- buffalo health problems

- goat health problems

- sheep health problems

- basic poultry health concerns if supported

- visible symptoms

- common warning signs

- vaccination concepts

- preventive animal healthcare

- hygiene

- parasite-related concerns

- skin/coat abnormalities

- eye abnormalities

- digestive warning signs

- respiratory warning signs

- injuries

- dehydration warning signs

- fever-related signs

- behavioral changes

- emergency warning signs

- when veterinary attention is needed

Organize the knowledge into structured documents/data that the AI service can retrieve.

Example:

User question

+

Animal type

+

Symptoms

+

Image

        ↓

Relevant JeevRakshak knowledge retrieval

        ↓

Multimodal AI model

        ↓

Context-aware response

The AI should use this knowledge as supporting context.

DO NOT invent veterinary facts.

DO NOT claim that this knowledge base makes the AI a veterinarian.

DO NOT present AI output as a confirmed diagnosis.

============================================================

10. AI SYSTEM INSTRUCTIONS

============================================================

Create a strong system instruction for the JeevRakshak AI.

The AI should behave as:

"JeevRakshak AI — an animal-health information and preliminary assessment assistant."

The AI should:

- ask relevant follow-up questions

- understand animal type

- understand symptoms

- consider the user's description

- consider uploaded images when supported

- provide observations

- explain possible concerns

- identify urgency

- suggest appropriate next steps

- encourage professional veterinary care when necessary

- avoid false certainty

- clearly separate observations from possibilities

- explain limitations

The AI must NOT say:

"This is definitely disease X."

Instead use language such as:

"The image may show signs consistent with..."

"Possible concerns include..."

"A veterinarian should examine the animal to confirm."

For emergency situations, prioritize professional veterinary assistance.

============================================================

11. AI IMAGE ANALYSIS

============================================================

When the user uploads an animal image:

Animal image

+

Animal type

+

User description

+

Symptoms

        ↓

Backend

        ↓

Multimodal AI

        ↓

Analysis

The AI should analyze the CURRENT uploaded image.

The result should include structured sections such as:

1. Image observations

2. Visible signs

3. Possible concerns

4. Urgency level

5. Recommended next step

6. Questions for the owner

7. Veterinary-care recommendation

The model must not pretend to see something that is not visible.

If the image quality is poor:

Tell the user that the image is insufficient for reliable visual assessment and ask for a clearer image or more information.

============================================================

12. AI CHAT ASSISTANT

============================================================

Redesign ONLY the AI CHAT COMPONENT if necessary, while keeping the website's existing visual language.

The AI chat should support:

- text questions

- animal type

- symptoms

- description

- image upload

- image preview

- follow-up questions

- conversation history

- contextual responses

- suggested questions

- emergency warning detection

Example flow:

User:

"My dog is not eating."

AI should not immediately produce a generic fixed response.

It should ask useful contextual questions such as:

- How long has the dog not been eating?

- Is the dog drinking water?

- Are there other symptoms?

- Is the dog unusually weak?

- Any vomiting/diarrhea?

- Age and approximate size?

Then respond based on the answers.

============================================================

13. AI MUST NOT RETURN THE SAME RESULT

============================================================

Every AI request must contain the relevant current context.

Do not cache all users into one static result.

Do not use one global response.

Do not accidentally reuse the previous conversation.

Ensure:

- conversation IDs are correct

- messages are stored correctly

- user context is separated

- image references are associated with the correct request

- prompt/context is generated from the current request

- AI output is saved correctly

Test multiple different inputs.

Example:

Input A:

Dog + skin problem + image A

Input B:

Cow + eye problem + image B

Input C:

Goat + digestive problem + image C

The outputs should be meaningfully different and based on the provided inputs.

============================================================

14. AI FAILURE HANDLING

============================================================

If the AI provider is unavailable:

DO NOT return fake AI results.

Show:

"AI analysis is temporarily unavailable. Please try again or contact a veterinarian."

Log the real technical error server-side.

Do not make the user believe an AI analysis occurred when it did not.

============================================================

15. FARMER / PET OWNER SYSTEM

============================================================

Preserve the current UI.

Make functionality persistent and real.

Users should be able to:

- register

- login

- logout

- manage animals

- add animal

- edit animal

- view animal

- upload animal photo

- view vaccination records

- add vaccination

- edit vaccination

- view medical history

- request veterinary help

- use AI assistance

- view previous requests

- receive notifications

============================================================

16. ANIMAL RECORDS

============================================================

Each animal must have persistent information.

Use the existing schema where possible.

Information may include:

- animal ID

- name

- species

- breed

- age

- gender

- owner

- image

- health information

- vaccination history

- medical history

- created date

- updated date

Data must persist after refresh and login/logout.

============================================================

17. VACCINATION SYSTEM

============================================================

Make vaccination functionality REAL.

Support:

- add vaccination

- edit vaccination

- delete vaccination where appropriate

- view vaccination history

- vaccine name

- vaccination date

- next due date

- notes

- status

Persist everything in the database.

Do not rely only on React state/local state.

============================================================

18. MEDICAL RECORDS

============================================================

Make past animal records persistent.

Users should be able to view appropriate historical information.

Doctors/veterinarians should be able to add medical notes/recommendations according to the existing workflow and authorization.

Do not expose private records to unauthorized users.

============================================================

19. DOCTOR / VETERINARIAN WORKFLOW

============================================================

Preserve the existing UI/UX.

Make the workflow real.

Doctor/vet should be able to:

- receive cases

- view requests

- view animal information

- view uploaded image

- view symptoms

- view description

- view location where appropriate

- accept request

- reject request

- update status

- add medical notes

- provide recommendations

- view authorized previous records

Possible statuses:

PENDING

ACCEPTED

IN_PROGRESS

RESOLVED

REJECTED

============================================================

20. PUBLIC EMERGENCY FLOW WITHOUT LOGIN

============================================================

Preserve this core flow:

Someone sees an injured/ill animal

↓

Click Help an Animal / Report Animal

↓

Take/upload photo

↓

Image preview

↓

Select animal type

↓

Describe problem

↓

Location

↓

AI preliminary assessment

↓

Submit emergency request

↓

Veterinary assistance workflow

No login should be required if the existing design supports public emergency reporting.

Make the entire workflow real.

============================================================

21. LOCATION

============================================================

Inspect the current location implementation.

Fix it if broken.

Handle:

- browser location permission

- manual location where appropriate

- coordinates

- displaying location

- sending location to backend

- associating location with emergency requests

Do not expose precise location unnecessarily.

============================================================

22. DATABASE

============================================================

Inspect the existing Drizzle schema.

Do not replace the database system unnecessarily.

Add/modify tables only where required.

Ensure correct relationships for:

- users

- roles

- animals

- vaccinations

- medical records

- emergency requests

- AI conversations

- AI messages

- attachments

- notifications

- doctor/veterinarian profiles

- locations

Use proper migrations.

DO NOT destroy existing data.

============================================================

23. API AUDIT

============================================================

Audit every API used by the application.

For every endpoint verify:

- URL

- HTTP method

- authentication

- authorization

- request body

- response format

- validation

- database operation

- error handling

Frontend and backend must use matching types/interfaces.

============================================================

24. AUTHENTICATION

============================================================

Inspect and repair the current authentication.

Verify:

- registration

- login

- logout

- session/token persistence

- protected routes

- roles

- unauthorized access

- expired sessions

- refresh behavior

Do not break existing accounts.

============================================================

25. SECURITY

============================================================

Protect:

- API keys

- database credentials

- authentication tokens

- private animal records

- medical records

- private user information

Never expose secrets in frontend code.

Validate:

- API input

- file uploads

- IDs

- authorization

Users must not be able to access another user's private records by changing an ID.

============================================================

26. REMOVE MOCK DATA

============================================================

Search the entire repository for:

mock

dummy

fake

sample

placeholder

hardcoded

static

TODO

test response

demo

prototype

Remove fake production behavior.

Do not remove legitimate development/test utilities if they are clearly separated.

============================================================

27. ERROR HANDLING

============================================================

Replace unexplained generic errors with meaningful messages.

Examples:

"Unable to connect to the server."

"Image upload failed."

"Unable to submit the report."

"Session expired. Please log in again."

"AI analysis is temporarily unavailable."

But do not hide the actual underlying error.

Fix the actual root cause whenever possible.

============================================================

28. PERFORMANCE AND SCALABILITY

============================================================

Keep the application architecture scalable.

It should be possible to support:

- many users

- many animals

- many reports

- many veterinarians

- multiple locations

- large medical histories

- large AI conversation history

- mobile application later

- multiple AI providers later

Use:

- pagination

- proper indexes

- reusable services

- clean API architecture

- efficient database queries

- proper file storage

- asynchronous processing where appropriate

Do not introduce unnecessary complexity.

============================================================

29. AI COST / FREE-TIER REQUIREMENT

============================================================

I currently do NOT want to pay for an expensive AI infrastructure.

Design the AI integration so it can work with a suitable free/free-tier or locally deployable model where technically possible.

IMPORTANT:

Do not hardcode one provider so tightly that the entire application depends on it.

Create a provider abstraction.

Example:

AIService

   ↓

Provider Adapter

   ↓

Configured AI Model

This allows the model/provider to be replaced later.

If a provider requires a key or has a quota:

- keep the key server-side

- use environment variables

- clearly document setup

- do not fake results when quota is exhausted

If no AI provider is configured, show a real error instead of pretending analysis happened.

============================================================

30. AI KNOWLEDGE BASE / RAG

============================================================

Create a maintainable veterinary knowledge structure.

Prefer structured documents/data over embedding huge amounts of information directly into frontend code.

The knowledge base should be retrievable by:

- species

- symptom

- health category

- emergency level

Example categories:

DOG

CATTLE

BUFFALO

GOAT

SHEEP

GENERAL LIVESTOCK

Health categories:

SKIN

EYES

RESPIRATORY

DIGESTIVE

INJURY

PARASITES

VACCINATION

BEHAVIOR

FEVER/WARNING SIGNS

GENERAL PREVENTION

Use the retrieved context to improve AI answers.

The system must remain transparent that this is informational/preliminary AI assistance.

============================================================

31. AI RESPONSE FORMAT

============================================================

Where appropriate, return structured JSON internally.

Example:

{

  "summary": "...",

  "observations": [],

  "possibleConcerns": [],

  "urgency": "LOW | MODERATE | HIGH | EMERGENCY",

  "recommendedNextSteps": [],

  "followUpQuestions": [],

  "needsVeterinarian": true,

  "disclaimer": "..."

}

Do not expose raw model JSON if it makes the UI worse.

Map the structured response into the existing JeevRakshak UI.

============================================================

32. TEST THE AI PROPERLY

============================================================

Do not test only one question.

Test multiple distinct cases.

TEXT:

Dog not eating

Cow with eye irritation

Goat with unusual behavior

Dog with skin issue

IMAGE:

Use multiple different animal images.

Verify:

- current image is actually sent

- current animal type is sent

- current description is sent

- response changes according to the input

- no static response is being returned

Also test follow-up questions.

============================================================

33. END-TO-END TESTING

============================================================

Test:

A. Registration

B. Login

C. Logout

D. Add animal

E. Upload animal image

F. Image preview

G. Save animal

H. Refresh

I. Image still visible

J. Add vaccination

K. Refresh

L. Vaccination still exists

M. Add/view medical record

N. Report emergency case

O. Upload emergency image

P. Image appears

Q. Submit report

R. No network error

S. Request appears in backend/database

T. Doctor/vet receives request

U. Doctor/vet accepts request

V. Status changes

W. User sees updated status

X. AI text analysis

Y. AI image analysis

Z. Different inputs produce different analysis

AA. AI failure produces honest error

AB. Logout/login preserves data

============================================================

34. CONSOLE + SERVER CLEANUP

============================================================

Before considering the project complete:

Check browser console.

Check server logs.

Fix:

- JavaScript errors

- TypeScript errors

- failed network requests

- broken routes

- missing environment variables

- unhandled promise rejections

- database errors

- image loading errors

- CORS errors

Remove unnecessary debug logs from production.

============================================================

35. PRODUCTION CONFIGURATION

============================================================

Create/update:

.env.example

Document all required environment variables.

Never commit real secrets.

Make sure:

development environment

and

production environment

do not accidentally use the same hardcoded localhost URLs.

============================================================

36. DO NOT BREAK WORKING FEATURES

============================================================

Before changing an existing feature:

Understand how it works.

If it already works:

KEEP IT.

If it partially works:

FIX IT.

If it is mock/demo:

CONVERT IT TO REAL FUNCTIONALITY.

If it is completely broken:

REPAIR IT using the existing architecture where possible.

============================================================

37. DEVELOPMENT ORDER

============================================================

Work in this order:

PHASE 1

Complete repository audit.

PHASE 2

Identify all bugs and broken flows.

PHASE 3

Fix server/API/network errors.

PHASE 4

Fix database operations.

PHASE 5

Fix image upload/storage/preview/persistence.

PHASE 6

Fix authentication.

PHASE 7

Fix animal records.

PHASE 8

Fix vaccination and medical records.

PHASE 9

Fix emergency reporting.

PHASE 10

Fix doctor/veterinarian workflow.

PHASE 11

Implement real AI service.

PHASE 12

Implement veterinary knowledge layer/RAG.

PHASE 13

Implement real multimodal image analysis.

PHASE 14

Test different AI inputs.

PHASE 15

Remove SIH/demo/mock content.

PHASE 16

Full end-to-end testing.

PHASE 17

Production cleanup.

============================================================

38. IMPORTANT: WORK IN SMALL VERIFIED STEPS

============================================================

Do NOT make thousands of uncontrolled changes at once.

After each major phase:

1. Build the project.

2. Check for errors.

3. Run tests.

4. Verify affected features.

5. Fix regressions.

6. Continue to the next phase.

If something is already working, don't unnecessarily rewrite it.

============================================================

39. FINAL ACCEPTANCE CRITERIA

============================================================

The project is COMPLETE only when:

[UI]

✓ Existing JeevRakshak UI/UX preserved

✓ No unnecessary redesign

✓ Responsive design still works

[SIH CLEANUP]

✓ SIH references removed

✓ Hackathon/demo labels removed

✓ Prototype/demo banners removed

✓ Fake demo data removed

[REPORTING]

✓ Report case works

✓ No unexplained Network Error

✓ Request reaches backend

✓ Request is stored

✓ Status works

[IMAGES]

✓ Image preview works

✓ Actual image is visible

✓ Image can be removed/replaced

✓ Image uploads successfully

✓ Image is stored persistently

✓ Image survives refresh

✓ Image appears in records

✓ Doctor/vet can view appropriate images

[FARMER/PET OWNER]

✓ Login works

✓ Animals persist

✓ Vaccinations persist

✓ Medical history persists

✓ Previous requests persist

[DOCTOR/VET]

✓ Requests arrive

✓ Request details work

✓ Image works

✓ Status updates work

✓ Medical notes work

[AI]

✓ AI is a REAL model integration

✓ No hardcoded AI responses

✓ No fake AI results

✓ Current user input is processed

✓ Current image is processed

✓ Different inputs produce different results

✓ Follow-up conversation works

✓ Veterinary knowledge layer is used

✓ AI clearly identifies preliminary assessment

✓ AI does not claim confirmed diagnosis

✓ AI failure is shown honestly

[SECURITY]

✓ No API keys exposed

✓ No database credentials exposed

✓ Proper authorization

✓ Private records protected

[QUALITY]

✓ No major console errors

✓ No major server errors

✓ Production build succeeds

✓ Critical user flows tested

✓ No fake functionality

============================================================

40. FINAL INSTRUCTION

============================================================

REMEMBER:

I DO NOT WANT A NEW JEEVRAKSHAK WEBSITE.

I WANT MY EXISTING JEEVRAKSHAK WEBSITE FIXED AND UPGRADED.

KEEP THE UI/UX.

REMOVE THE SIH DEMO CONTENT.

FIX THE NETWORK ERROR.

MAKE IMAGE UPLOAD REAL AND PERSISTENT.

MAKE THE REPORTING SYSTEM REAL.

MAKE FARMER/PET OWNER RECORDS REAL.

MAKE VACCINATION RECORDS REAL.

MAKE DOCTOR/VETERINARIAN REQUESTS REAL.

MAKE THE AI ACTUALLY ANALYZE THE USER'S TEXT AND IMAGE.

REMOVE STATIC/REPEATED AI RESPONSES.

ADD A VETERINARY KNOWLEDGE LAYER/RAG TO MAKE THE AI MORE JEEVRAKSHAK-SPECIFIC.

DO NOT PRETEND THAT A FAILED AI REQUEST WORKED.

DO NOT USE FAKE AI RESPONSES.

DO NOT REBUILD THE FRONTEND UNNECESSARILY.

DO NOT DELETE WORKING FEATURES.

FIX, UPGRADE, TEST, AND VERIFY THE EXISTING PROJECT.

Start by auditing the existing repository and identifying the current architecture and critical failures. Then proceed through the phases above.

                 JEEVRAKSHAK

                      │

          ┌───────────┼───────────┐

          ▼           ▼           ▼

      FARMER /     DOCTOR /    HELP AN

      PET OWNER    VETERINARIAN  ANIMAL

          │           │           │

       LOGIN        LOGIN       NO LOGIN

          │           │           │

          ▼           ▼           ▼

      Dashboard    Doctor       Emergency

      + Animals    Dashboard    Report

      + Vaccines   + Requests   + Photo

      + Records    + Cases      + AI

      + AI         + Records    + Location

this is the code repo link https://github.com/raghav-0808/jeevrakshak go through it and do as directed
add sign in and login option at the web and save sign in detail at backend 
and ui ux font and all things keep same

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f2c283f6-32ef-4e2b-9bbe-2afe1fc2c7a3).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
