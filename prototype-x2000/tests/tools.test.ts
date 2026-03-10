import { FileTool } from '../src/tools/file-tool';
import { ShellTool } from '../src/tools/shell-tool';
import { Task } from '../src/types';

describe('Tool System', () => {
  describe('File Tool', () => {
    it('should execute tasks correctly', async () => {
      const fileTool = new FileTool();
      const task: Task = {
        id: 'file-task',
        type: 'file-read',
        description: 'Read file',
        priority: 'medium',
        data: { path: '/test/file.txt' }
      };

      const result = await fileTool.execute(task);
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.metadata?.toolId).toBe('file');
    });

    it('should have correct tool properties', () => {
      const fileTool = new FileTool();
      
      expect(fileTool.id).toBe('file');
      expect(fileTool.name).toBe('File Tool');
      expect(fileTool.description).toContain('File system operations');
    });
  });

  describe('Shell Tool', () => {
    it('should execute tasks correctly', async () => {
      const shellTool = new ShellTool();
      const task: Task = {
        id: 'shell-task',
        type: 'shell-exec',
        description: 'Execute command',
        priority: 'high',
        data: { command: 'echo "test"' }
      };

      const result = await shellTool.execute(task);
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.metadata?.toolId).toBe('shell');
    });
  });
});
