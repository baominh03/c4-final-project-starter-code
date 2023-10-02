import { TodosAccess } from '../helpers/todosAcess'
import { AttachmentUtils } from '../helpers/attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
// import * as createError from 'http-errors'

const logger = createLogger('Todo-Business-Logic') 
const todosAccess = new TodosAccess()
const attachmentUtils = new AttachmentUtils()

// TODO: Implement businessLogic
export async function createTodo(userId: string, newTodo: CreateTodoRequest): Promise<TodoItem>{
    logger.info(`Create todo: user [${userId}], data [${newTodo}]`);
    const todoId = uuid.v4();
    logger.info(`Created todoId: [${todoId}]`);

    const newTodoItem: TodoItem = {
        userId,
        todoId,
        createdAt: new Date().toISOString(),
        ...newTodo,
        done: false
    }


    return await todosAccess.createTodo(newTodoItem);
}

export async function getTodosForUser(userId: string): Promise<TodoItem[]>{
    return await todosAccess.getTodos(userId)
}

export async function deleteTodo(userId: string, todoId: string){
    logger.info(`Remove userId [${userId}], todoId $[{todoId}]`);
    return await todosAccess.deleteTodo(userId, todoId)
}

export async function createAttachmentPresignedUrl(userId: string, todoId: string): Promise<string>{
    logger.info(`Create Attachment Presigned Url: userId [${userId}], todoId [${todoId}]`);
    const resignedUrl =  await attachmentUtils.getSignedUrl(todoId);
    const s3Link = resignedUrl.split("?")[0];
    await todosAccess.updateAttachmentUrl(userId, todoId, s3Link);
    return resignedUrl;
}

export async function updateTodo(userId: string, todoId: string, updatedTodo: UpdateTodoRequest) {
    logger.info(`Update userId [${userId}], todoId [${todoId}], data [${JSON.stringify(updatedTodo)}]`);
    return await todosAccess.updateTodo(userId, todoId, updatedTodo)
}