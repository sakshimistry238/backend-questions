import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import AppConfiguration from './config/app.config';
import DatabaseConfiguration from './config/database.config';
import AuthConfiguration from './config/auth.config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule } from './providers/database/postgres/database.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './security/auth/auth.module';
import { QuestionsModule } from './questions/questions.module';
import { QuizModule } from './quiz/quiz.module';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { JwtAuthGuard } from './security/auth/guards/jwt-auth.guard';
import { HttpExceptionFilter } from './common/exceptions/http-exception.filter';
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [AppConfiguration, DatabaseConfiguration, AuthConfiguration],
      ignoreEnvFile: false,
      isGlobal: true,
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    QuestionsModule,
    QuizModule,
  ],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    ConfigService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
