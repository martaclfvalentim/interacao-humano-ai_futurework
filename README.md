# FutureWork #

Career and Job Help Platform, with the main objective of helping new graduates and experienced profissionals navigate the current difficult job market situation. App built with React

## Setup ##

```bash
npm install
npm run dev
```

Backend:

```bash
cd backend
npm install
node server.js
```

Currently using Groq API. An .env file with a API key is required in the backend folder (free api keys are available)
Example of a .env file content:

```text
GROQ_API_KEY = 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
```

There is a current problem with the possibility that the chat does not connect immediately when it popups. Writing "Hi" or similar messages seems to sucessfully restore the connection and make it work properly without polluting the chat

The chat does not currently influence the sugestion outcome like it is supposed to

The server uses local Ollama in case groq fails
For that, Ollama needs to be installed on the host (just like node.js)
If Ollama is not running, use:

```bash
ollama serve
```

Also make sure that image is pulled (4.7gb of storage necessary):

```bash
ollama pull llama3 
```

## Project Info ##

### Data Ecosystem ###

The system uses data parsed from a user CV, its chat questions and answers, and the user's results feedback. It also needs acess to the external web, in order to retrieve information on current job listings, company reputation, and market trends.

The system may also ingest some interaction signals (for example, which jobs users clicked the most) in order to better itself and provide better results.

In order to not have to retrain the system constantly (which would pose gigantic costs), the application should store various interactions and feedback on a database. This data is, in regular intervals, digested into a separate database storing this summarized user interaction information. The system can then retrive this information on the companies/jobs in order to get acess to an regularly updated source on the job market, company work life balance, employes opinion on its benefits, etc. This should be combined with regular internet searches and human supervision in order for the system to be updated

To summarize, we need to avoid re-pre-training (the mass data ingestion part of training) the LLM as much as possible, and aim to keep a updated databse where it can search regularly updated information. Human lead Reinforcement Learning can still be regularly done, and user interaction and feedback history should help in optimizing its results.

### Architecture and Interaction Design ###

This repo does not represent the entirety of the proposed system.

The system should have 2 databases: One for the raw interactions between the users and the system, and another one for the digested and summarized one. An LLM (with possible human supervision) should summarize all the raw interactions and informations on to the second database. It should prioritize more recent developments and signals.

The system would work in 3 parts working semi-autonomously:

The first part summarizes the user CV. The user then corrects and adds missing information, and passes it to the second part.

In the second part, the system recieves this data, and asks the user open endend questions based on it. In the end, it summarizes its conclusions and pass it to the third part.

In the third part, the system recieves the information summarized by the secon part (incluiding information retrieved by the first part) and searches for matching jobs on the external web. It then should re-avaluate the jobs based on the information recieved from the user and the information present on the second database, and if needed, re-search the web. After this, the listings should be evaluated and scored, and a justification behind the score should be visible.

The User should be able to click the link to the post, and give feedback related to the job postings (Simple signals or open endend feedback). This should then be stored into the first database.

To conclude, the user should be able to easly enter its CV and correct any missinterpretations or missing info derived from the AI analysis. It should then be able to give more precise information about its situation and wants/needs to the System. In the need, it should be able to see the systems recommendations and its respective explanations, as well as give feedback about it.

## Current Limitations ##

The current application (built with a lot of help from AI tools) works only as a demonstration and not as a finalized working product. It uses an external LLM cloud provider (oLlama in Groq) for all of its assignments, and does not currenly store any information on a "raw" database, nor summarizes it into a second database (they are not even implmented). This means that the system, as it stands, will not improve over time, as we cant neither train the LLM, nor can we give it the accumulated feedback.

Some technical limitations of the prototype also include the fact that the chat contents are not being correctly passed to the search part of the system. They are, however, passed to the scorer. Also, there is currently no option on the frontend to give open endend feedback on the system results.

The information is being passed around the system in the form of Json outputs, in most of its cases.
