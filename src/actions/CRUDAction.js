"use server";
import { connectToDatabase } from "@/config/MongoDB";
import { revalidatePath } from "next/cache";


export const FetchDataToCollection = async (collection, query = {}) => {
  const { db } = await connectToDatabase();
  const collectionName = db.collection(collection);
  try {
    const result = await collectionName.find(query).toArray();
    revalidatePath("/");
    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const FetchSingleDocs = async (collection, queryObject) => {
  const { db } = await connectToDatabase();
  try {
    const result = await db.collection(collection).findOne(queryObject);

    if (!result) {
      throw new Error("Document not found");
    }

    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};

/** ✅ Update Document (with automatic updatedAt) */
export const UpdateDocument = async (collection, filter, updateData) => {
  const { db } = await connectToDatabase();
  const collectionName = db.collection(collection);

  try {
    const result = await collectionName.updateOne(filter, {
      $set: {
        ...updateData,
        updatedAt: new Date(), // ✅ Always update timestamp
      },
    });

    if (result.matchedCount === 0) {
      throw new Error("No document found to update");
    }

    revalidatePath("/");
    return { success: true, matched: result.matchedCount, modified: result.modifiedCount };
  } catch (error) {
    console.error("Error updating document:", error);
    throw new Error(error.message);
  }
};