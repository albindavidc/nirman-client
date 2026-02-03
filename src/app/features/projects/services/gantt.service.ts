import { Injectable } from '@angular/core';
import { Task } from './task.service';
import { format } from 'date-fns';

export interface FrappeGanttTask {
  id: string;
  name: string;
  start: string;
  end: string;
  progress: number;
  dependencies: string;
  custom_class?: string;
  _task?: Task; // Original task reference for event handling
}

@Injectable({
  providedIn: 'root',
})
export class GanttService {
  constructor() {}

  mapTasksToDhtmlx(
    tasks: Task[],
    dependencies: any[] = [],
    phaseMap: Map<string, string> = new Map(),
  ): { data: any[]; links: any[] } {
    const data = tasks.map((task) => {
      // Format dates as YYYY-MM-DD HH:mm
      const start = task.plannedStartDate
        ? format(new Date(task.plannedStartDate), 'yyyy-MM-dd HH:mm')
        : format(new Date(), 'yyyy-MM-dd HH:mm');

      // DHTMLX calculates duration automatically if end_date is provided, or we can provide duration.
      // Let's provide end_date.
      const end = task.plannedEndDate
        ? format(new Date(task.plannedEndDate), 'yyyy-MM-dd HH:mm')
        : null;

      const duration = !end ? 1 : undefined;

      // css class for status
      const type = 'task'; // 'project' or 'task' or 'milestone'

      return {
        id: task.id,
        text: task.name,
        start_date: start,
        end_date: end,
        duration: duration,
        progress: (task.progress || 0) / 100, // DHTMLX expects 0-1
        // parent: 0, // No hierarchy for now unless we have subtasks
        type: type,
        status: task.status, // Custom property for styling
        phaseName: phaseMap.get(task.phaseId) || 'Unknown Phase',
        _task: task, // Original task reference
      };
    });

    const links = dependencies.map((dep, index) => ({
      id: dep.id || index + 1,
      source: dep.predecessorTaskId,
      target: dep.successorTaskId,
      type: '0', // '0' = finish_to_start
    }));

    return { data, links };
  }
}
