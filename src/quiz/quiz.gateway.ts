import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { QuizService } from './quiz.service';
import { SocketAuthMiddleware } from './ws.middleware';

@WebSocketGateway({
  cors: {
    origin: '*', // adjust for prod
  },
})
export class QuizGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  private static userTimers: Map<string, NodeJS.Timeout> = new Map();
  constructor(private readonly quizService: QuizService) {}

  afterInit(server: Server) {
    try {
      server.use(SocketAuthMiddleware());
    } catch (error) {
      server.close(error);
    }
  }

  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
  }

  //   @SubscribeMessage('get-question')
  //   async handleGetQuestion(client: Socket, payload: any) {
  //     const question = await this.quizService.rendomQuiz({ userId: payload.userId });
  //     client.emit('question-response', question);
  //   }

  //   @SubscribeMessage('submit-answer')
  //   async handleSubmitAnswer(client: Socket, payload: any) {
  //     const result = await this.quizService.checkAnswer(payload, { userId: payload.userId });
  //     client.emit('answer-response', result);
  //   }

  //   @SubscribeMessage('quit-quiz')
  //   async handleQuitGame(client: Socket, payload: any) {
  //     const quit = await this.quizService.quitQuiz({ userId: payload.userId });
  //     client.emit('quit-response', quit);
  //   }

  @SubscribeMessage('get-question')
  async assignQuestions(client: Socket) {
    const question: any = await this.quizService.generateQuestion(
      client?.data?.user,
    );

    this.server.to(client.id).emit('question', question);

    const timer = setTimeout(() => {
      this.handleTimeout(client);
    }, 1000 * 60);
    QuizGateway.userTimers.set(client.id, timer);
  }

  @SubscribeMessage('submit-answer')
  async submitAnswer(client: Socket, payload: any) {
    const answer: any = await this.quizService.checkAnswer(
      payload,
      client?.data?.user,
    );

    this.clearUserTimer(client.id);
    this.server.to(client.id).emit('answer', JSON.stringify(answer));

    if (answer.currentLevel >= 10) {
      this.server.to(client.id).emit('win', JSON.stringify(answer));
    }

    if (!answer.isCorrect || answer.currentLevel >= 10) {
      client.disconnect(true);
    }
  }

  private handleTimeout(client: Socket) {
    this.quizService.updateQuizStatus(client);
    this.server.to(client.id).emit('error', 'Your time is out brother!!');
    client.disconnect(true);
  }

  private clearUserTimer(clientId: string) {
    const timer = QuizGateway.userTimers.get(clientId);
    if (timer) {
      clearTimeout(timer);
      QuizGateway.userTimers.delete(clientId);
    }
  }

  //   @SubscribeMessage('lifeline')
  //   async lifeline(client: Socket, payload: any) {
  //     const lifeline = await this.quizService.lifeline(
  //       client?.data?.user,
  //       payload,
  //     );
  //     this.server.to(client.id).emit('lifeline', JSON.stringify(lifeline));
  //   }

  @SubscribeMessage('quit-quiz')
  async quitQuiz(client: Socket) {
    const quit = await this.quizService.quitQuiz(client?.data?.user);

    this.server.to(client.id).emit('win', JSON.stringify(quit));
    QuizGateway.userTimers.delete(client.id);
  }
}
