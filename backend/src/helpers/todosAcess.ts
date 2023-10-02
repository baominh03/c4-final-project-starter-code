import * as AWS from 'aws-sdk'
//Refer https://knowledge.udacity.com/questions/70893
const AWSXRay = require('aws-xray-sdk')
import { DeleteItemOutput, DocumentClient, UpdateItemOutput } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

export class TodosAccess {
    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly createdAtIndex = process.env.TODOS_CREATED_AT_INDEX
    ) { }

    async getTodos(userId: string): Promise<TodoItem[]> {
        const result = await this.docClient
            .query({
                TableName: this.todosTable,
                IndexName: this.createdAtIndex,
                KeyConditionExpression: 'userId = :userId',
                ExpressionAttributeValues: {
                    ':userId': userId
                }
            })
            .promise()

        logger.info("Retrieved todo items", {userId, "count" : result.Count})

        const items = result.Items

        return items as TodoItem[]
    }

    async createTodo(newTodoItem: TodoItem): Promise<TodoItem> {
        await this.docClient
            .put({
                TableName: this.todosTable,
                Item: newTodoItem
            })
            .promise()

        logger.info("Saved new todo item", {newTodoItem} )
        
        return newTodoItem
    }    

    async deleteTodo(userId: string, todoId: string) {
        const deleteItem:DeleteItemOutput = await this.docClient
            .delete({
                TableName: this.todosTable,
                Key: {todoId, userId},
                ReturnValues: "ALL_OLD"
            })
            .promise()

        const deletedTodo = deleteItem.Attributes

        logger.info("Deleted todo item", {deletedTodo})    
    }  
    
    async updateTodo(userId: string, todoId: string, updatedProperties: UpdateTodoRequest) {
        const updateItem: UpdateItemOutput= await this.docClient
            .update({
                TableName: this.todosTable,
                Key: {todoId, userId},
                ReturnValues: "ALL_NEW",
                UpdateExpression:
                  'set #name = :name, #dueDate = :duedate, #done = :done',
                ExpressionAttributeValues: {
                  ':name': updatedProperties.name,
                  ':duedate': updatedProperties.dueDate,
                  ':done': updatedProperties.done
                },
                ExpressionAttributeNames: {
                  '#name': 'name',
                  '#dueDate': 'dueDate',
                  '#done': 'done'
                }
            })
            .promise()

        const updatedTodo = updateItem.Attributes

        logger.info("Updated todo item", {updatedTodo} )
    }

    async updateAttachmentUrl(userId: string, todoId: string, attachmentUrl: string) {
        const updateItem: UpdateItemOutput = await this.docClient
            .update({
                TableName: this.todosTable,
                Key: {todoId, userId},
                ReturnValues: "ALL_NEW",
                UpdateExpression:
                  'set #attachmentUrl = :attachmentUrl',
                ExpressionAttributeValues: {
                  ':attachmentUrl': attachmentUrl
                },
                ExpressionAttributeNames: {
                  '#attachmentUrl': 'attachmentUrl'
                }
            })
            .promise()

        const updatedTodo = updateItem.Attributes

        logger.info("Updated attachmentUrl of todo item", {updatedTodo} )
    }    
}