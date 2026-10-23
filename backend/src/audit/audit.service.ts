import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

export interface RecordLogParams {
  action: string;
  actorId?: string | null;
  actorEmail?: string | null;
  targetId?: string | null;
  targetEmail?: string | null;
  details?: Record<string, any>;
  ipAddress?: string | null;
}

export interface GetLogsParams {
  page?: number;
  limit?: number;
  action?: string;
  actorEmail?: string;
  targetEmail?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Records an immutable audit log entry in the database.
   * Strips any sensitive credentials before recording.
   */
  async recordLog(params: RecordLogParams) {
    try {
      // Clean sensitive properties from details if present
      const safeDetails = params.details ? { ...params.details } : undefined;
      if (safeDetails) {
        delete safeDetails.password;
        delete safeDetails.passwordHash;
        delete safeDetails.token;
        delete safeDetails.accessToken;
        delete safeDetails.secret;
      }

      const log = await this.prisma.auditLog.create({
        data: {
          action: params.action,
          actorId: params.actorId || null,
          actorEmail: params.actorEmail || null,
          targetId: params.targetId || null,
          targetEmail: params.targetEmail || null,
          details: safeDetails || undefined,
          ipAddress: params.ipAddress || null,
        },
      });

      this.logger.log(
        `[AUDIT] Action: ${params.action} | Actor: ${params.actorEmail || 'SYSTEM'} | Target: ${params.targetEmail || 'N/A'}`,
      );

      return log;
    } catch (err: any) {
      this.logger.error(`Failed to record audit log for action ${params.action}: ${err.message}`);
      // Do not crash primary application flow if audit logging fails
      return null;
    }
  }

  /**
   * Retrieves paginated audit logs for administrators.
   */
  async getLogs(params: GetLogsParams) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(params.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.action) {
      where.action = { contains: params.action, mode: 'insensitive' };
    }
    if (params.actorEmail) {
      where.actorEmail = { contains: params.actorEmail, mode: 'insensitive' };
    }
    if (params.targetEmail) {
      where.targetEmail = { contains: params.targetEmail, mode: 'insensitive' };
    }

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
