# langchain-sql-query

# Steps

- In terminal,

1. npm i
2. cp .env.example .env
3. get open ai key and assembly ai key (optional)
4. npm run dev
5. ```
   curl --location 'http://localhost:3000/api/v1/query' \
   --header 'Content-Type: application/json' \
   --data '{
   "question": "How many projects are there?"
   }'
   ```

6. Testing audio file to text,
   ```
   curl --location 'http://localhost:3000/api/v1/audio' \
   --form 'audio=@"/Users/raktim/Projects/my_github/AI Projects/sql-query/public/image-1718133067607.wav"'
   ```
