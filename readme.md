# Submission for BiteSpeed Coding Assessment.

`Brief Problem Statement: Consolidate all linked records when calling a POST method`

<hr/>
### Local Setup

1. Clone the git repository and cd into it

```
git clone https://github.com/Ankitcode99/Identity-Reconcilation.git
cd Identity-Reconcilation
```

2. Install all the dependencies

```
npm install
```

3. Provide env variables

```
PORT = <PORT>

DB_HOST = <DB_HOST>
DB_USER = <DB_USER>
DB_PASSWORD = <DB_PASSWORD>
DB_DATABASE = <DB_DATABASE>
```

4. Start the dev server

```
npm run dev
```

<hr/>

## Usage

Use postman or any other api test tool to make a /POST request to the server with the following request body

```
"email": "test@example.com"
"phoneNumber": "123456"
```

Live Server URL: https://identity-reconcilation-bitespeed.onrender.com
