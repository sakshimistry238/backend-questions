import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    // Replace this with your actual MongoDB connection string
    MongooseModule.forRoot('mongodb://localhost:27017/backend', {
      // options (optional)
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    }),
  ],
  exports: [MongooseModule], // export so other modules can use it
})
export class DatabaseModule {}
