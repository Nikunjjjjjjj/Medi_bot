const { Pinecone } = require('@pinecone-database/pinecone');
const logger = require('../utils/logger');
const { getEmbedding } = require('./openai');

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});
const index = pinecone.Index(process.env.PINECONE_INDEX,process.env.PINECONE_HOST);
// import { Pinecone } from '@pinecone-database/pinecone'

// const pc = new Pinecone({ apiKey: "YOUR_API_KEY" })

// // To get the unique host for an index, 
// // see https://docs.pinecone.io/guides/manage-data/target-an-index
// const index = pc.index("INDEX_NAME", "INDEX_HOST")

// const queryResponse = await index.namespace('example-namespace').query({
//     vector: [0.0236663818359375,-0.032989501953125,...,-0.01041412353515625,0.0086669921875],
//     topK: 3,
//     includeValues: false,
//     includeMetadata: true,
// });
async function searchVectors(query) {
  try {
    const queryVector = await getEmbedding(query);
    
    const result = await index.namespace(process.env.PINECONE_NAMESPACE || 'default').query({
      topK: 3,
      vector: queryVector,
      includeMetadata: true,
      
    });
    //res = index.query(vector=[xq], top_k=5, include_metadata=True)   
    
    return result.matches || [];
  } catch (err) {
    logger.error('Pinecone query failed', err);
    throw err;
  }
}

module.exports = { searchVectors };


