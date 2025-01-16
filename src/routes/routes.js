import { randomUUID } from "node:crypto";
import { Database } from "../database.js";
import { buildRoutePath } from "../utils/build-route-path.js";

const database = new Database();

export const routes = [
  {
    method: "GET",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      const tasks = database.select("tasks");
      return res.end(JSON.stringify(tasks));
    },
  },
  {
    method: "POST",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      const { title, description } = req.body;
      if (!title || !description) {
        return res.writeHead(404).end(
          JSON.stringify({
            error: true,
            success: false,
            message: "title ou description não enviados.",
          })
        );
      }

      const task = {
        id: randomUUID(),
        title,
        description,
        created_at: new Date(),
        completed_at: null,
        update_at: new Date(),
      };

      database.insert("tasks", task);

      return res.writeHead(201).end(
        JSON.stringify({
          error: false,
          success: true,
          message: "Task CRIADA com sucesso.",
        })
      );
    },
  },
  {
    method: "PUT",
    path: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      const { id } = req.params;
      const { title, description } = req.body;

      if (!title || !description) {
        return res.writeHead(404).end(
          JSON.stringify({
            error: true,
            success: false,
            message: "title ou description não enviados.",
          })
        );
      }

      const rowIndex = database.update("tasks", id, {
        title,
        description,
        update_at: new Date(),
      });

      if (rowIndex === -1) {
        return res.writeHead(404).end(
          JSON.stringify({
            error: true,
            success: false,
            message: "Task não encontrada no bando de dados.",
          })
        );
      }

      return res.writeHead(202).end(
        JSON.stringify({
          error: false,
          success: true,
          message: "Task ATUALIZADA com sucesso.",
        })
      );
    },
  },
  {
    method: "DELETE",
    path: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      const { id } = req.params;

      const rowIndex = database.delete("tasks", id);
      if (rowIndex === -1) {
        return res.writeHead(404).end(
          JSON.stringify({
            error: true,
            success: false,
            message: "Task não encontrada no bando de dados.",
          })
        );
      }

      return res.writeHead(202).end(
        JSON.stringify({
          error: false,
          success: true,
          message: "Task DELETADA com sucesso.",
        })
      );
    },
  },

  {
    method: "PATCH",
    path: buildRoutePath("/tasks/:id/complete"),
    handler: (req, res) => {
      const { id } = req.params;

      const [task] = database.select("tasks", { id });
      if (!task) {
        return res.writeHead(404).end(
          JSON.stringify({
            error: true,
            success: false,
            message: "Task não encontrada no bando de dados.",
          })
        );
      }

      const isTaskCompleted = !!task.completed_at;
      const completed_at = isTaskCompleted ? null : new Date();

      database.update("tasks", id, { completed_at });

      return res.writeHead(202).end(
        JSON.stringify({
          error: false,
          success: true,
          message: "Task ATUALIZADA com sucesso.",
        })
      );
    },
  },
];
