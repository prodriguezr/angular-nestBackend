import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // const mongoUri = `mongodb://${configService.get<string>('MONGO_USER')}:${configService.get<string>('MONGO_PASS')}@${configService.get<string>('MONGO_HOST')}:${configService.get<string>('MONGO_PORT')}/${configService.get<string>('MONGO_DB')}?authSource=${configService.get<string>('MONGO_AUTH_SOURCE')}`;
        const mongoUri = configService.get<string>('MONGO_URI') ?? '';

        return { uri: mongoUri, dbName: configService.get<string>('MONGO_DB') };
      },
    }),
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  private readonly logger = new Logger(AppModule.name);
  private readonly mongoUri: string;
  constructor(private readonly configService: ConfigService) {
    // this.mongoUri = `mongodb://${configService.get<string>('MONGO_USER')}:${configService.get<string>('MONGO_PASS')}@${configService.get<string>('MONGO_HOST')}:${configService.get<string>('MONGO_PORT')}/${configService.get<string>('MONGO_DB')}?authSource=${configService.get<string>('MONGO_AUTH_SOURCE')}`;
    // this.logger.log(this.mongoUri);
    this.mongoUri = configService.get<string>('MONGO_URI') ?? '';
    this.logger.log(this.mongoUri);
  }
}
