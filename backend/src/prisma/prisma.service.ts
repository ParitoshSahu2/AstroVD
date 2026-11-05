import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const PRISMA_MODELS = new Set([
  'user',
  'auditLog',
  'walletTransaction',
  'astrologer',
  'booking',
  'product',
  'order',
  'orderItem',
  'passwordResetToken',
  'otpVerification',
  'appointmentSlot',
  'blockedDate',
]);

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  public isDatabaseConnected = false;

  constructor() {
    super();
    return new Proxy(this, {
      get(target: any, prop: string | symbol, receiver: any) {
        if (prop === 'isDatabaseConnected') return target.isDatabaseConnected;

        if (typeof prop === 'string' && PRISMA_MODELS.has(prop)) {
          if (!target.isDatabaseConnected) {
            return new Proxy(
              {},
              {
                get(_modelTarget, actionName) {
                  return async () => {
                    throw new Error(
                      `Database offline. Fast-fail action: ${prop}.${String(actionName)} (zero-latency fallback)`,
                    );
                  };
                },
              },
            );
          }
        }

        return Reflect.get(target, prop, receiver);
      },
    });
  }

  async onModuleInit() {
    try {
      const connectPromise = this.$connect();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Connection timeout to PostgreSQL')), 1500),
      );
      await Promise.race([connectPromise, timeoutPromise]);
      this.isDatabaseConnected = true;
      this.logger.log('Prisma connected to PostgreSQL database successfully.');
    } catch (err: any) {
      this.isDatabaseConnected = false;
      this.logger.warn(
        `PostgreSQL connection failed at startup: ${err.message}. Operating with zero-latency fallback mode.`,
      );
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
    } catch (err) {
      // ignore
    }
  }
}
