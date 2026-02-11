import { Injectable } from '@nestjs/common';
import { PrismaService } from '../src/infrastructure/persistence/prisma/prisma.service';

if (process.env.NODE_ENV !== 'test') {
  throw new Error('Orchestrator can only be used in test environment');
}
//TODO: Improve the orchestrator to handle test e2e
@Injectable()
export class Orchestrator {
  constructor(private readonly prisma: PrismaService) {}

  async clearDatabase(): Promise<void> {
    await this.prisma.kill.deleteMany();
    await this.prisma.match.deleteMany();
    await this.prisma.player.deleteMany();
    await this.prisma.weapon.deleteMany();
  }
}
