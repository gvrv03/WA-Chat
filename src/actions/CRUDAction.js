"use server";
import { connectToDatabase } from "@/config/MongoDB";
import { revalidatePath } from "next/cache";

export const AddDataToCollection = async (
  collection,
  data,
  permittedUserIds,
  ID
) => {
  const { db } = await connectToDatabase();
  const collectionName = db.collection(collection);
  try {
    const result = await collectionName.insertOne({
      ...data,
      _id: ID,
      permissions: {
        canUpdate: permittedUserIds, // List of user IDs who can update
        canDelete: permittedUserIds, // List of user IDs who can delete
        canRead: permittedUserIds, // List of user IDs who can delete
      },
    });
    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};

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
